import { Config } from "remotion";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, RenderMediaOnProgress } from "@remotion/renderer";
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser, { json } from 'body-parser'
import cors from 'cors'
import youtubeDlExec from "youtube-dl-exec";
import { v4 as uuidv4 } from "uuid";
import { FileUpload } from "./src/generated";
import AWS from "aws-sdk";
import { google } from "googleapis";
import fetch from 'node-fetch';
const app = express();
app.use(bodyParser.json());
app.use(cors())
const port = 8000;
const compositionId = "RemoteVideo";

const supabaseUrl = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0Nzk5ODMwMSwiZXhwIjoxOTYzNTc0MzAxfQ.gHxe-icsTI5Zww6EqHQ5Gsbw1F0gFUSqyOGIJkHu4jU';
dotenv.config()
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
  secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]
});
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
    .from('composition')
    .select(
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
app.post('/render', async (req, res) => {
  // console.log(req)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  try {
      console.log(req.body)
      const compId = req.body.compositionId
      // send sqs message containing the compId to render
      const sqs = new AWS.SQS({
        region: "us-east-1",
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });
      const sqsParams = {
        QueueUrl: 'https://sqs.us-east-1.amazonaws.com/752885906760/render-queue',
        MessageBody: JSON.stringify({
          compositionId: compId
        }),
        DelaySeconds: 0
      };
      sqs.sendMessage(sqsParams, (err: any, data: any) => {
        if (err) {
          console.log(err)
          res.json({ "status": "404", "error": err })
        } else {  

          console.log(data)
          res.json({ "status": "200" })
        }
      })
  } catch (err) {
    res.json({ "status": "404", "error": err })
  }
});

// fetches a video from yotube using youtube DL 
const fetchYT = async (clipURL: string, fileName: string) => {
  // youtubeDlExec()
  try {
    await youtubeDlExec(
      clipURL,
      {
        // dumpSingleJson: true,
        noWarnings: true,
        // noCallHome: true,
        noCheckCertificate: true,
        // preferFreeFormats: true,
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio",
        mergeOutputFormat: "mp4",
        youtubeSkipDashManifest: true,
        output: fileName
      })
    return true
  } catch (err) {
    console.warn(err)
    return false
  }
}
app.post('/yt', async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  // console.log(process.env)
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Clip URL to fetch using YT download
    const clipURL = req.body.clipURL
    // user's ID in supabase
    const userID = req.body.userID
    console.log("Downloading video at " + clipURL)
    const fileName = userID + ".mp4"
    fetchYT(clipURL, fileName).then(ytRes => {
      // console.log(ytRes)
      if (ytRes) {
        // upload data, create entry in video meta, generate video ID and return it as data
        const videoUUID = uuidv4();
        const storeName = videoUUID + ".mp4"
        // const filesDir = fs.readdirSync(path.join(__dirname, fileName))
        // console.log(filesDir)
        const fileData = fs.readFileSync(path.join(__dirname, fileName))

        supabase.storage.from("video").upload(storeName, fileData, {
          upsert: true,
          contentType: "video/mp4"
        }).then(supabase_res => {
          console.log(supabase_res)
          if (!supabase_res.error) {
            fs.unlinkSync(fileName);
            const publicurl = supabase.storage.from("video").getPublicUrl(storeName).publicURL
            const videoMeta: FileUpload = {
              id: videoUUID,
              user_id: userID,
              file: publicurl!,
              fileType: "mp4",
              name: clipURL,
              framesPerSecond: 30,
            };
            supabase.from("fileupload").upsert({
              id: videoMeta.id,
              user_id: videoMeta.user_id,
              file: videoMeta.file,
              fileType: videoMeta.fileType,
              name: videoMeta.name,
              thumbnail: videoMeta.thumbnail,
              size: videoMeta.size,
              framesPerSecond: videoMeta.framesPerSecond,
              numberOfFrames: videoMeta.numberOfFrames,
            }).then(uploadStatus => {
              console.log(uploadStatus)

              if (!uploadStatus.error) {
                res.json({ "status": "200", "metadata": videoMeta, "id": videoUUID })
              } else {
                res.json({ "status": "500", "err": "DB system error" })
              }
            })
          } else {
            fs.unlinkSync(fileName);
            res.json({ "status": "500", "err": "File system error" })
          }
        });
      } else {
        res.json({ "status": "500", "err": "error fetching/downloading source clip" })
      }
      // res.send( JSON.stringify(ytRes)
    });
  } catch (err) {
    console.warn(err)
    res.json({ "status": "404", "error": err })
  }


});
app.get('/', function (req, res) {
  return res.json({ "status": "200" });    //return response as JSON
});
app.post("/export/yt", async (req, res) => {
  const OAuth2 = google.auth.OAuth2;

  // video category IDs for YouTube:
  const categoryIds = {
    Entertainment: "24",
    Education: "27",
    ScienceTechnology: "28",
    Gaming: "20"
    }

  // If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
  const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

  const title = req.body.title
  const description = req.body.description
  const tags = req.body.tags
  const videoUrl = req.body.videoUrl

  const credentials = {}

  fetch(videoUrl)
  .then(res => res.body) // Gets the response and returns it as a blob
  .then(fileStream => { // use blob in uploadVIdeo portion of code
    authorize(credentials, (auth:any) => uploadVideo(auth, title, description, tags, fileStream));
  });

function uploadVideo(auth: any, title:string, description:string, tags: string[], file: any) {
  console.log("postcallback")
  console.log(file)
  const service = google.youtube('v3')
  service.videos.insert({
    auth: auth,
    part: ['snippet','status'],
    requestBody: {
      snippet: {
        title: title,
        description: description,
        tags: tags,
        categoryId: categoryIds.Gaming,
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en'
      },
      status: {
        privacyStatus: "private",
        selfDeclaredMadeForKids: false,

      },
    },
    media: {
      mimeType: file.type,
      body: file
    }
  },function(err:any, response:any) {
    if (err) {
      console.log('The API returned an error: ' + err);
      // refresh(auth)
      res.json({ "status": "500", "error": err });
    }
    console.log(response.data)
    res.json({ "status": "200", "data": response.data })
    // console.log('Video uploaded. Uploading the thumbnail now.'))
  })
}
// function refresh(auth) {

// }
function authorize(credentials: any, callback: any) {

  const clientId = "156288769306-jgt1cdpo88r8vq66eg8mj2br9mhoaelq.apps.googleusercontent.com";
  const clientSecret = "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";
  const redirectUrl = "https://dev.streampro.gg/" 

  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  supabase.from("userdata").select("youtubeAccess, youtubeRefresh").eq("id", req.body.userID).single().then(accessToken => {
    console.log(accessToken)
    if (accessToken.data.youtubeAccess) {
      oauth2Client.setCredentials(accessToken.data.youtubeAccess);
      if(accessToken.data.youtubeRefresh != null) {
          oauth2Client.setCredentials({
            refresh_token: accessToken.data.youtubeRefresh
          });
        }
      console.log("precallback")
      
      oauth2Client.refreshAccessToken((err, tokens) => {
        callback(oauth2Client);
      });
    } else {
      res.json({ "status": "500", "error": "No access token found for user " + req.body.userID})
    }
  })
}


  
});

app.post("/export/insta", async (req, res) => {
 res.send(200) 
});
app.listen(port);

console.log(
  [
    `The server has started on http://localhost:${port}!`,
    'You can render a video by passing props as URL parameters.',
    '',
    'If you are running Hello World, try this:',
    '',
    `http://localhost:${port}?titleText=Hello,+World!&titleColor=red`,
    '',
  ].join('\n')
);
