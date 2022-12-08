import { Consumer } from "sqs-consumer";
import AWS from "aws-sdk";
import https from "https"
import dotenv from 'dotenv';
import { getCompositions, renderMedia, RenderMediaOnProgress } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0Nzk5ODMwMSwiZXhwIjoxOTYzNTc0MzAxfQ.gHxe-icsTI5Zww6EqHQ5Gsbw1F0gFUSqyOGIJkHu4jU';
dotenv.config()
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
  secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]
});

const compositionId = "RemoteVideo";

let totalFrames = 0;
let globalRenderedFrames = 0;
let supabase: SupabaseClient | undefined = undefined;
let currentComposition: string | undefined = undefined;
const render = async (serverCompID: string, timestamp: string) => {
  // The composition you want to render
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  currentComposition = serverCompID
  // Create a webpack bundle of the video.
  // You only have to do this, you can reuse the bundle.
  const bundleLocation = await bundle(require.resolve("./src/index"));
  let compositionMeta = {

  }
  const { data, error } = await supabase
    .from('composition').select(
      `*`
    )
    .eq('id', serverCompID)
    .single();

  if (!error) {
    if (data?.size?.width > data?.size?.height) {
      console.log("Swapping")
      compositionMeta = {
        width: data?.size?.height,
        height: data?.size?.width,
        fps: data?.state?.framesPerSecond,
        duration: data?.state?.durationInFrames
      }
    } else {
      compositionMeta = {
        width: data?.size?.width,
        height: data?.size?.height,
        fps: data?.state?.framesPerSecond,
        duration: data?.state?.durationInFrames
      }
    }
  } else {
    throw new Error(`No renmote composition with the ID ${serverCompID} found`);
  }
  // setting total frames
  totalFrames = data?.state?.durationInFrames
  // Parametrize the video by passing arbitrary props to your component.
  const inputProps = {
    compId: serverCompID,
    ...compositionMeta
  };

  // Extract all the compositions you have defined in your project
  // from the webpack bundle.
  const comps = await getCompositions(bundleLocation, {
    // You can pass custom input props that you can retrieve using getInputProps()
    // in the composition list. Use this if you want to dynamically set the duration or
    // dimensions of the video.
    inputProps,
  });

  // Select the composition you want to render.
  const composition = comps.find((c) => c.id === compositionId);

  // Ensure the composition exists
  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found`);
  }
  try {
    await renderMedia({
      timeoutInMilliseconds: 140000,
      // dumpBrowserLogs: true,
      composition,
      // how we might be able to estimate progress
      onProgress: handleRenderProgress,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: `out/${serverCompID}.mp4`,
      inputProps,
      parallelism: 8,
      //chromiumOptions: { gl: "egl" }
    });
    return true
  } catch (err) {
    console.log(err)
    return false
  }

};
const handleRenderProgress: RenderMediaOnProgress = ({
  renderedFrames,
  encodedFrames,
  encodedDoneIn,
  renderedDoneIn,
  stitchStage,
}) => {
  if (stitchStage === "encoding" && supabase == undefined) {
    // First pass, parallel rendering of frames and encoding into video
    console.log("Encoding...");
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabase?.from("renderStatus").upsert({
      id: currentComposition, created_at: new Date().toISOString()
    }).then(data => {
      console.log(data)
    })
  }
  // else if (stitchStage === "muxing") {
  //   // Second pass, adding audio to the video
  //   console.log("Muxing audio...");
  // }
  // // Amount of frames rendered into images
  // supabase.from("renderStatus").upsert(i
  globalRenderedFrames = renderedFrames
  if (globalRenderedFrames % 10 == 0) {
    // console.log(supabase)
    console.log(`${renderedFrames} rendered out of ${totalFrames}`);
    console.log(`${(globalRenderedFrames / totalFrames) * 100}% done`);
    supabase?.from("renderStatus").upsert({
      id: currentComposition, currentFrames: globalRenderedFrames, totalFrames: totalFrames, done: false
    }).then(data => {
      console.log(data)
    })
  }

  // // Amount of frame encoded into a video
  // console.log(`${encodedFrames} encoded`);
  // Time to create images of all frames
  if (renderedDoneIn !== null) {
    console.log(`Rendered in ${renderedDoneIn}ms`);
  }
  // Time to encode video from images
  if (encodedDoneIn !== null) {
    console.log(`Encoded in ${encodedDoneIn}ms`);
    supabase?.from("renderStatus").upsert({
      id: currentComposition, done: true,
      currentFrames: totalFrames, totalFrames: totalFrames,
      finishedAt: new Date().toISOString()
    }).then(res => {
      console.log(res)
    })
    totalFrames = 0;
    globalRenderedFrames = 0;
    currentComposition = undefined;
    supabase = undefined;
  }
}

async function handler(message: any) {
  // if we recieved a valid message
  if (message) {
    // decoding json of sqs message
    const msgJson = JSON.parse(message.Body)
    // if the message contains a composition id
    if ("compositionId" in msgJson) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        // console.log(msgJson.body)
        // getting composition ID for the desired compositon to render

        const compId = msgJson.compositionId
        const timestamp = new Date().getTime().toString();
        const renderResult = await render(compId, timestamp)
        if (renderResult) {
          // loading file object
          const fileName = `${compId}.mp4`
          const localFileName = `out/${fileName}`
          const fileData = fs.readFileSync(path.join(__dirname, localFileName))
          // upload to supabase
          const filePath = `exports/${fileName}`
          let { error: uploadError } = await supabase.storage
            .from("video")
            .upload(filePath, fileData);
          console.log(uploadError)
          // update composition/export table
          let { data, error: updateError } = await supabase
            .from("composition")
            .update({
              status: 'COMPLETE',
            }).eq("id", compId);
          console.log(data)
          console.log(updateError)

          // delete file
          // fs.unlinkSync(localFileName);
          // res.json({ "status": "200" })
          // render completed
          return

        } else {
          // 500 ISE error, TODO send to app analytics
          throw Error
          // res.json({ "status": "500", "error": "Error in rendering pipeline" })
        }

      } catch (err) {
        // didn't find file, 404
        console.error(err)
        throw Error
        // res.json({ "status": "404", "error": err })
      }

    }
    return
  }

}

// define specific SQS queue
const app = Consumer.create({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/752885906760/render-queue',
  handleMessage: async (message) => {
    handler(message)
  },
  region: 'us-east-1',
  sqs: new AWS.SQS({
    httpOptions: {
      agent: new https.Agent({
        keepAlive: true
      })
    }
  })
});

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();