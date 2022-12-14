import axios from "axios";
import functions from "@google-cloud/functions-framework";
import sb from "@supabase/supabase-js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
// const functions = require("@google-cloud/functions-framework");
// const axios = require("axios");
// const sb = require("@supabase/supabase-js");
// const createClient = sb.createClient;
// const SupabaseClient = sb.SupabaseClient;

// import AWS from "aws-sdk";

functions.http("helloHttp", async (req, res) => {
	await captureData();
	res.send(`completed`);
});
const supabaseUrl = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAyNjQ3ODgsImV4cCI6MTk4NTg0MDc4OH0.LYtwEpZwITCBjKJXfsgadZlZM6hdoKvQPr-6ztCWR20";
// dotenv.config();
// const interval = setInterval(function () {}, 5000);
// clearInterval(interval);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function captureData() {
	// HERE there will need to be a for loop for each function
	const { data, error } = await supabase.from("openloot").select("responseId");

	// HERE is a for loop that will run the recurring metrics for every responseid in the openloot table
	if (data != null) {
		for (let i = 0; i < data.length; i++) {
			console.log("Running loop for accountID: " + data[i].responseId);
			getTwitchData(data[i].responseId);
			getYoutubeData(data[i].responseId);
			getTwitterData(data[i].responseId);
			getTikTokData(data[i].responseId);
		}
		console.log("All Loop completed");
	}
}
// captureData();

// HERE we will have to write a typeform response api to get the email associated with the response ID for association within database

// HERE is the TikTOk recurring video metrics api w/ all video statistics.

async function getTikTokData(data) {
	const userresponseId = data;
	const { data: sbData, error } = await supabase
		.from("openloot")
		.select("tiktokAccess, tiktokRefresh, email")
		.eq("responseId", userresponseId)
		.single();
	// console.log(tiktokRefresh);
	const clientKey = "awl3jaifictg61ra";
	const clientSecret = "e5725165de62b1900cee71ee78ce7d44";
	if (sbData.tiktokAccess != null) {
		const refreshToken = {
			method: "POST",
			url: `https://open-api.tiktok.com/oauth/refresh_token/?client_key=${clientKey}&grant_type=refresh_token&refresh_token=${sbData.tiktokRefresh}`,
			headers: { "content-type": "application/x-www-form-urlencoded" },
		};
		await axios
			.request(refreshToken)
			.then(async function (response) {
				// console.log(response);
				await supabase
					.from("openloot")
					.update({
						tiktokAccess: response.data.data.access_token,
						tiktokRefresh: response.data.data.refresh_token,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
		const newAccessToken = await supabase
			.from("openloot")
			.select("tiktokAccess")
			.eq("responseId", userresponseId)
			.single();
		// console.log(newAccessToken.data.tiktokAccess);
		const getTikTokData = {
			method: "POST",
			url: "https://open-api.tiktok.com/video/list/",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
				// Authorization: `Bearer ${newAccessToken.data.tiktokAccess}`,
			},
			data: {
				fields: [
					"video_description",
					"share_url",
					"title",
					"like_count",
					"comment_count",
					"share_count",
					"view_count",
					"id",
					"create_time",
				],
				access_token: `${newAccessToken.data.tiktokAccess}`,
			},
		};
		await axios
			.request(getTikTokData)
			.then(async function (response) {
				// console.log(response.data.data.videos);
				if (response.data.data.videos) {
					for (let i = 0; i < response.data.data.videos.length; i++) {
						const str = response.data.data.videos[i].video_description;
						const description = str.replace(/(\r\n|\n|\r)/gm, " ");
						const { data, error } = await supabase.from("tiktok").upsert({
							id: response.data.data.videos[i].id,
							responseId: userresponseId,
							url: response.data.data.videos[i].share_url,
							description: description,
							title: response.data.data.videos[i].title,
							likeCount: response.data.data.videos[i].like_count,
							shareCount: response.data.data.videos[i].share_count,
							viewCount: response.data.data.videos[i].view_count,
							commentCount: response.data.data.videos[i].comment_count,
							email: sbData.email,
							published: response.data.data.videos[i].create_time,
						});
					}
				}
				// HERE we will be updating the row in GBQ where responseId is equal to x
				// await supabase
				//   .from("openloot")
				//   .update({ tiktokRecurring: response.data })
				//   .eq("responseId", userresponseId)
				//   .single();
				// const query = "UPDATE dataset.open_loot "`SET tiktokRecurring = ${response.data} ``WHERE responseId = ${userresponseId}`;
				// query_job = bigqueryClient.query(query);
				// query_job.result();
			})
			.catch(function (error) {
				console.log(error);
			});
	}
	console.log("TikTok Loop completed");
}
// HERE is the youtube recurring video metrics api w/ all video statistics.
async function getYoutubeData(data) {
	let userresponseId = data;

	const { data: sbData, error } = await supabase
		.from("openloot")
		.select("youtubeAccess, youtubeRefresh, email")
		.eq("responseId", userresponseId)
		.single();
	const clientId =
		"109739013430-07r0sf26hduocuaoqjf0rmt9ofutlqg2.apps.googleusercontent.com";
	const clientSecret = "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";
	if (sbData.youtubeAccess != null) {
		const refreshToken = {
			method: "POST",
			url: `https://oauth2.googleapis.com/token?prompt=consent&grant_type=refresh_token&refresh_token=${sbData.youtubeRefresh}&client_id=${clientId}&client_secret=${clientSecret}`,
			headers: {
				Authorization: `Bearer ${sbData.youtubeAccess}`,
				"content-type": "application/x-www-form-urlencoded",
			},
		};
		await axios
			.request(refreshToken)
			.then(async function (response) {
				await supabase
					.from("openloot")
					.update({
						youtubeAccess: response.data.access_token,
						youtubeRefresh: response.data.refresh_token,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
		const newAccessToken = await supabase
			.from("openloot")
			.select("youtubeAccess")
			.eq("responseId", userresponseId)
			.single();
		// const channelId = await supabase
		//   .from("openloot")
		//   .select("youtubeBasic")
		//   .eq("responseId", userresponseId)
		//   .single();
		// console.log(channelId.data.youtubeBasic.items[0].id);
		const getVideoData = {
			method: "GET",
			url: `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&order=date&type=video`,
			// url: `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&channelId=${channelId.data.youtubeBasic.items[0].id}&order=date`,
			// url: `https://www.googleapis.com/youtube/v3/videos?channelId=${id.data.youtubeid}&fields=items(id,snippet(title,categoryId),statistics)&part=snippet`,
			headers: {
				Authorization: `Bearer ${newAccessToken.data.youtubeAccess}`,
				"content-type": "application/x-www-form-urlencoded",
			},
		};
		await axios
			.request(getVideoData)
			.then(async function (response) {
				// console.log(response.data.items);
				// let youtubevideoRecurring = [];
				for (let i = 0; i < response.data.items.length; i++) {
					// console.log(response.data.items[i]);
					const getvideoViews = {
						method: "GET",
						url: `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${response.data.items[i].id.videoId}`,
						headers: {
							Authorization: `Bearer ${newAccessToken.data.youtubeAccess}`,
							"content-type": "application/x-www-form-urlencoded",
						},
					};
					await axios
						.request(getvideoViews)
						.then(async function (response) {
							// console.log(response.data.items[0].id);
							for (let i = 0; i < response.data.items.length; i++) {
								// console.log(response.data.items[i]);
								const str = response.data.items[i].snippet.description;
								const description = str.replace(/(\r\n|\n|\r)/gm, " ");
								const { data, error } = await supabase.from("youtube").upsert({
									id: response.data.items[i].id,
									tag: response.data.items[i].snippet.tags,
									title: response.data.items[i].snippet.title,
									description: description,
									likeCount: response.data.items[i].statistics.likeCount,
									viewCount: response.data.items[i].statistics.viewCount,
									commentCount: response.data.items[i].statistics.commentCount,
									dislikeCount: response.data.items[i].statistics.dislikeCount,
									favoriteCount:
										response.data.items[i].statistics.favoriteCount,
									responseId: userresponseId,
									email: sbData.email,
									published: response.data.items[i].snippet.publishedAt,
								});
							}
						})
						.catch(function (error) {
							console.log(error);
						});
				}

				// await supabase
				//   .from("openloot")
				//   .update({ youtubeRecurring: youtubevideoRecurring, id: response. })
				//   .eq("responseId", userresponseId)
				//   .single();
			})
			.catch(function (error) {
				console.log(error);
			});
		// const getSubscriberCount = {
		//   method: "GET",
		//   url: `https://youtube.googleapis.com/youtube/v3/channels?client_id=${clientId}&part=snippet%2CcontentDetails%2Cstatistics&mine=true`,
		//   headers: {
		//     Authorization: `Bearer ${youtubeAccess.data.youtubeAccess}`,
		//     "content-type": "application/x-www-form-urlencoded",
		//   },
		// };
		// await axios
		//   .request(getSubscriberCount)
		//   .then(async function (response) {
		//     // console.log(response.data.items[0].statistics.subscriberCount);
		//     await supabase
		//       .from("openloot")
		//       .update({
		//         youtubesubscriberCount:
		//           response.data.items[0].statistics.subscriberCount,
		//       })
		//       .eq("responseId", userresponseId)
		//       .single();
		//   })
		//   .catch(function (error) {
		//     console.log(error);
		//   });
	}
	console.log("youtube data updated");
}
// HERE is the twitter recurring tweet metrics api w/ all tweet statistics.

async function getTwitterData(data) {
	let userresponseId = data;

	const { data: sbData, error } = await supabase
		.from("openloot")
		.select("twitterAccess, twitterRefresh, email")
		.eq("responseId", userresponseId)
		.single();
	const clientSecret = "dUF2wRhLxJVT615PcUXdifYb1Uj85yAnrtdzpbUf5pRVC-P5cR";
	if (sbData.twitterAccess != null) {
		const clientId = "UDJZRzBxMGZ4bWEtSDlQTWE1N2g6MTpjaQ";
		const options = {
			method: "POST",
			url: `https://api.twitter.com/2/oauth2/token?grant_type=refresh_token&refresh_token=${sbData.twitterRefresh}&client_id=${clientId}&client_secret=${clientSecret}`,
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
		};
		await axios
			.request(options)
			.then(async function (response) {
				console.log(response.data);
				const { data, error } = await supabase
					.from("openloot")
					.update({
						twitterAccess: response.data.access_token,
						twitterRefresh: response.data.refresh_token,
					})
					.eq("responseId", userresponseId)
					.single();
				console.log(error);
			})
			.catch(function (error) {
				console.log(error);
			});
		const newAccessToken = await supabase
			.from("openloot")
			.select("twitterAccess")
			.eq("responseId", userresponseId)
			.single();
		const twitterId = await supabase
			.from("openloot")
			.select("twitterId")
			.eq("responseId", userresponseId)
			.single();
		// console.log(twitterId.data.twitterBasic.data.id);
		const getTweets = {
			method: "GET",
			url: `https://api.twitter.com/2/users/${twitterId.data.twitterId}/tweets?expansions=referenced_tweets.id&tweet.fields=created_at,id,text,public_metrics,entities`,
			headers: {
				Authorization: `Bearer ${newAccessToken.data.twitterAccess}`,
			},
		};
		await axios
			.request(getTweets)
			.then(async function (response) {
				// console.log(response.data.data[0].entities.hashtags);
				// await supabase
				//   .from("openloot")
				//   .update({ twitterRecurring: response.data })
				//   .eq("responseId", userresponseId)
				//   .single();
				// const query = `UPDATE dataset.open_loot SET twitterRecurring = ${response.data} WHERE responseId = ${userresponseId}`;
				// query_job = bigqueryClient.query(query);
				// query_job.result();
				if (response.data != null || response.data != undefined) {
					for (let i = 0; i < response.data.data.length; i++) {
						const str = response.data.data[i].text;
						const str2 = str.replace(/(\r\n|\n|\r)/gm, " ");
						const text = str.replace(/(\r\n|\n|\r)/gm, " ");
						const { data, error } = await supabase.from("twitter").upsert(
							{
								responseId: userresponseId,
								id: response.data.data[i].id,
								retweetCount:
									response.data.data[i].public_metrics.retweet_count,
								replyCount: response.data.data[i].public_metrics.reply_count,
								likeCount: response.data.data[i].public_metrics.like_count,
								quoteCount: response.data.data[i].public_metrics.quote_count,
								text: text,
								email: sbData.email,
								dateCreated: response.data.data[i].created_at,
							},
							{ onConflict: "id" }
						);
					}
				}

				// console.log(response.data.data);
				// console.log(response.data.data.public_metrics.retweet_count);
			})
			.catch(function (error) {
				console.log(userresponseId);
			});
		const { data: newsbData, error } = await supabase
			.from("openloot")
			.select("twitterAccess, twitterRefresh, email, twitterId")
			.eq("responseId", userresponseId)
			.single();
		const spacesAccess = await supabase
			.from("openloot")
			.select("twitterAccess")
			.eq("responseId", userresponseId)
			.single();
		const getSpaces = {
			method: "GET",
			url: `https://api.twitter.com/2/spaces/by/creator_ids?user_ids=${newsbData.twitterId}&space.fields=title,invited_user_ids,participant_count,subscriber_count,speaker_ids,lang,scheduled_start&expansions=creator_id&user.fields=created_at,username`,
			headers: {
				Authorization: `Bearer ${spacesAccess.data.twitterAccess}`,
			},
		};
		await axios
			.request(getSpaces)
			.then(async function (response) {
				console.log(response.data);
				for (let i = 0; i < response.data.data.length; i++) {
					const str = response.data.data[i].title;
					const text = str.replace(/(\r\n|\n|\r)/gm, " ");

					const { data, error } = await supabase.from("twitterspaces").upsert(
						{
							responseId: userresponseId,
							email: newsbData.email,
							title: text,
							creatorId: response.data.data[i].creator_id,
							participantCount: response.data.data[i].participant_count,
							subscriberCount: response.data.data[i].subscriber_count,
							lang: response.data.data[i].lang,
							scheduledStart: response.data.data[i].scheduled_start,
							spaceId: response.data.data[i].id,
						},
						{ onConflict: "spaceId" }
					);
					console.log("twitter spaces updated");
					console.log(error);
					// console.log(data);
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	}
}
// HERE is the twitch recurring video metrics api w/ all channel video statistics.

async function getTwitchData(data) {
	// const { userresponseId } = req.body;
	const userresponseId = data;

	const typeformId = "HYOosRUX";
	const typeformToken =
		"tfp_DMMrznnKFHV7fvzgxJ3iDMKJFrT8ZvVWCfYKTSWGztnW_3w4N3Qpgk6rHg3";
	const typeformResponse = {
		method: "GET",
		url: `https://api.typeform.com/forms/${typeformId}/responses?included_response_ids=${userresponseId}&fields=krDc198u5nVB`,
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			Authorization: `Bearer ${typeformToken}`,
		},
	};
	await axios
		.request(typeformResponse)
		.then(async function (response) {
			console.log(response.data);
			console.log(response);
			// console.log(response.data.items[0].answers[0].email);
			if (response.data.items != null) {
				await supabase
					.from("openloot")
					.update({ email: response.data.items[0].answers[0].email })
					.eq("responseId", userresponseId)
					.single();
			}
		})
		.catch(function (error) {
			console.log(error);
		});

	const { data: sbData, error } = await supabase
		.from("openloot")
		.select("twitchAccess, twitchRefresh, twitchuserId, email")
		.eq("responseId", userresponseId)
		.single();
	// console.log(sbData);
	// console.log(error);
	const clientId = "yk62ix6gpuplw5acj37vh5l06zjobw";
	const clientSecret = "os7gvwyrfbxmvs5c5uzst3bixgf0s8";
	// const redirectUrl = "";
	if (sbData.twitchAccess != null) {
		const clientidClips = "yk62ix6gpuplw5acj37vh5l06zjobw";
		const options = {
			method: "POST",
			url: `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&refresh_token=${sbData.twitchRefresh}`,
			headers: { "content-type": "application/x-www-form-urlencoded" },
		};
		await axios
			.request(options)
			.then(async function (response) {
				// console.log(response);
				await supabase
					.from("openloot")
					.update({
						twitchAccess: response.data.access_token,
						twitchRefresh: response.data.refresh_token,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
		const newAccessToken = await supabase
			.from("openloot")
			.select("twitchAccess")
			.eq("responseId", userresponseId)
			.single();
		const gettwitchVideos = {
			method: "GET",
			url: `https://api.twitch.tv/helix/videos?user_id=${sbData.twitchuserId}`,
			headers: {
				Authorization: `Bearer ${newAccessToken.data.twitchAccess}`,
				"Client-Id": `${clientidClips}`,
			},
		};
		await axios
			.request(gettwitchVideos)
			.then(async function (response) {
				if (response.data.data != null || response.data.data != undefined) {
					for (let i = 0; i < response.data.data.length; i++) {
						const str = response.data.data[i].description;
						const description = str.replace(/(\r\n|\n|\r)/gm, " ");
						const { data, error } = await supabase.from("twitch").upsert(
							{
								videoId: response.data.data[i].id,
								userId: response.data.data[i].user_id,
								responseId: userresponseId,
								url: response.data.data[i].url,
								title: response.data.data[i].title,
								viewCount: response.data.data[i].view_count,
								description: description,
								email: sbData.email,
								published: response.data.data[i].published_at,
							},
							{ onConflict: "videoId" }
						);
					}
				}

				// const data = JSON.stringify(response.data.data);
				// console.log(data);
				// const query = `UPDATE mindr-359117openloot.twitch SET twitchRecurring = ${data} WHERE responseId = ${userresponseId}`;
			})
			.catch(function (error) {
				console.log(error);
			});
	}
	console.log("twitch data updated");
}
