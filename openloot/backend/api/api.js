import { createClient, SupabaseClient } from "@supabase/supabase-js";
// import AWS from "aws-sdk";
import axios from "axios";
import express, { raw, response } from "express";
import cors from "cors";
// import { BigQuery } from "@google-cloud/bigquery";
// const bigqueryClient = new BigQuery();
const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;
const supabaseUrl = supabseUrlENV; // dotenv.config();
const supabaseAnonKey = supabaseAnonKeyENV; // dotenv.config();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.post("/twitch", (req, res) => {
	const userresponseId = req.body.responseId;
	const code = req.body.code;
	async function getTwitchtoken() {
		const clientId = "yk62ix6gpuplw5acj37vh5l06zjobw";
		const redirectUri = "https://ambassador.openloot.com/twitch-auth";
		const clientSecret = clientSecret;
		const AccessToken = await supabase
			.from("openloot")
			.select("twitchAccess")
			.eq("responseId", userresponseId)
			.single();
		console.log(AccessToken);
		if (AccessToken.data.twitchAccess == null) {
			var options = {
				method: "POST",
				url: "https://id.twitch.tv/oauth2/token",
				header: { "content-type": "application/x-www-form-urlencoded" },
				data: new URLSearchParams({
					grant_type: "authorization_code",
					client_id: `${clientId}`,
					client_secret: `${clientSecret}`,
					code: `${code}`,
					// need to determine what page the client wants to redirect to after auth
					redirect_uri: `${redirectUri}`,
				}),
			};
			await axios
				.request(options)
				.then(async function (response) {
					// console.log(response);
					// HERE WE WILL NEED TO STORE THE ACCESS AND REFRESH TOKEN IN THE DATABASE
					const { data, error } = await supabase
						.from("openloot")
						.update({
							twitchAccess: response.data.access_token,
							twitchRefresh: response.data.refresh_token,
						})
						.eq("responseId", userresponseId)
						.single();
					console.log(error);
					const newAccessToken = await supabase
						.from("openloot")
						.select("twitchAccess")
						.eq("responseId", userresponseId)
						.single();
					const options2 = {
						method: "GET",
						url: "https://id.twitch.tv/oauth2/validate",
						headers: {
							Authorization: `OAuth ${newAccessToken.data.twitchAccess}`,
						},
					};
					// HERE we validated the token given to us by twitch and stored the associated user id in the database
					await axios.request(options2).then(async function (response) {
						// console.log(response + "validate");
						await supabase
							.from("openloot")
							.update({ twitchuserId: response.data.user_id })
							.eq("responseId", userresponseId)
							.single();
						// await supabase
						//   .from("openloost")
						//   .update({ twitchBasic: response.data })
						//   .eq("responseId", userresponseId)
						//   .single();
						const client_id = "yk62ix6gpuplw5acj37vh5l06zjobw";
						const options3 = {
							method: "GET",
							url: "https://api.twitch.tv/helix/users",
							headers: {
								Authorization: `Bearer ${newAccessToken.data.twitchAccess}`,
								"Client-Id": `${client_id}`,
							},
							data: new URLSearchParams({
								id: `${response.data.user_id}`,
							}),
						};
						// HERE we made a request to twitch api go get the user and associated basic information
						await axios
							.request(options3)
							.then(async function (response) {
								// console.log(response.data.data);
								const str = response.data.data[0].description;
								const description = str.replace(/(\r\n|\n|\r)/gm, " ");
								const { data, error } = await supabase
									.from("openloot")
									.update({
										twitchURL:
											"twitch.tv/" + response.data.data[0].display_name,
										twitchviewCount: response.data.data[0].view_count,
										twitchDescription: description,
										twitchdisplayName: response.data.data[0].display_name,
										twitchbroadcasterType:
											response.data.data[0].broadcaster_type,
									})
									.eq("responseId", userresponseId)
									.single();
							})
							.catch(function (error) {
								console.log(error);
							});
						const getFollowers = {
							method: "GET",
							url: `https://api.twitch.tv/helix/users/follows?to_id=${response.data.user_id}`,
							headers: {
								Authorization: `Bearer ${newAccessToken.data.twitchAccess}`,
								"Client-Id": `${client_id}`,
							},
						};
						await axios
							.request(getFollowers)
							.then(async function (response) {
								console.log(response.data.total);
								console.log("responseTotal");
								await supabase
									.from("openloot")
									.update({
										twitchFollowers: response.data.total,
									})
									.eq("responseId", userresponseId)
									.single();
							})
							.catch(function (error) {
								console.log(error);
							});
					});
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	}
	// setTimeout(getTwitchtoken(), 1500);
	setTimeout(() => {
		getTwitchtoken();
	}, 1500);
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/twitchProfile", (req, res) => {
	const userresponseId = req.body.responseId;
	const code = req.body.code;
	// console.log(code);
	async function getTwitchtoken() {
		const clientId = "yk62ix6gpuplw5acj37vh5l06zjobw";
		const redirectUri = "https://ambassador.openloot.com/auth-page";
		const clientSecret = "os7gvwyrfbxmvs5c5uzst3bixgf0s8";
		const AccessToken = await supabase
			.from("openloot")
			.select("twitchAccess")
			.eq("responseId", userresponseId)
			.single();
		// console.log(AccessToken);
		if (AccessToken.data.twitchAccess == null) {
			var options = {
				method: "POST",
				url: "https://id.twitch.tv/oauth2/token",
				header: { "content-type": "application/x-www-form-urlencoded" },
				data: new URLSearchParams({
					grant_type: "authorization_code",
					client_id: `${clientId}`,
					client_secret: `${clientSecret}`,
					code: `${code}`,
					// need to determine what page the client wants to redirect to after auth
					redirect_uri: `${redirectUri}`,
				}),
			};
			await axios
				.request(options)
				.then(async function (response) {
					// console.log(response);
					// HERE WE WILL NEED TO STORE THE ACCESS AND REFRESH TOKEN IN THE DATABASE
					const { data, error } = await supabase
						.from("openloot")
						.update({
							twitchAccess: response.data.access_token,
							twitchRefresh: response.data.refresh_token,
						})
						.eq("responseId", userresponseId)
						.single();
					console.log(error);
					const newAccessToken = await supabase
						.from("openloot")
						.select("twitchAccess")
						.eq("responseId", userresponseId)
						.single();
					const options2 = {
						method: "GET",
						url: "https://id.twitch.tv/oauth2/validate",
						headers: {
							Authorization: `OAuth ${newAccessToken.data.twitchAccess}`,
						},
					};
					// HERE we validated the token given to us by twitch and stored the associated user id in the database
					await axios.request(options2).then(async function (response) {
						// console.log(response + "validate");
						await supabase
							.from("openloot")
							.update({ twitchuserId: response.data.user_id })
							.eq("responseId", userresponseId)
							.single();
						// await supabase
						//   .from("openloost")
						//   .update({ twitchBasic: response.data })
						//   .eq("responseId", userresponseId)
						//   .single();
						const client_id = "yk62ix6gpuplw5acj37vh5l06zjobw";
						const options3 = {
							method: "GET",
							url: "https://api.twitch.tv/helix/users",
							headers: {
								Authorization: `Bearer ${newAccessToken.data.twitchAccess}`,
								"Client-Id": `${client_id}`,
							},
							data: new URLSearchParams({
								id: `${response.data.user_id}`,
							}),
						};
						// HERE we made a request to twitch api go get the user and associated basic information
						await axios
							.request(options3)
							.then(async function (response) {
								// console.log(response.data.data);
								const str = response.data.data[0].description;
								const description = str.replace(/(\r\n|\n|\r)/gm, " ");
								const { data, error } = await supabase
									.from("openloot")
									.update({
										twitchURL:
											"twitch.tv/" + response.data.data[0].display_name,
										twitchviewCount: response.data.data[0].view_count,
										twitchDescription: description,
										twitchdisplayName: response.data.data[0].display_name,
										twitchbroadcasterType:
											response.data.data[0].broadcaster_type,
									})
									.eq("responseId", userresponseId)
									.single();
							})
							.catch(function (error) {
								console.log(error);
							});
						const getFollowers = {
							method: "GET",
							url: `https://api.twitch.tv/helix/users/follows?to_id=${response.data.user_id}`,
							headers: {
								Authorization: `Bearer ${newAccessToken.data.twitchAccess}`,
								"Client-Id": `${client_id}`,
							},
						};
						await axios
							.request(getFollowers)
							.then(async function (response) {
								// console.log(response.data);
								// console.log(response.data.total);
								await supabase
									.from("openloot")
									.update({ twitchFollowers: response.data.total })
									.eq("responseId", userresponseId)
									.single();
							})
							.catch(function (error) {
								console.log(error);
							});
					});
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	}
	getTwitchtoken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/twitchDashboard", (req, res) => {
	const userresponseId = req.body.responseId;
	const code = req.body.code;
	// console.log(code);
	async function getTwitchtoken() {
		const clientId = "yk62ix6gpuplw5acj37vh5l06zjobw";
		const redirectUri = "https://ambassador.openloot.com/dashboard";
		const clientSecret = "os7gvwyrfbxmvs5c5uzst3bixgf0s8";
		const AccessToken = await supabase
			.from("openloot")
			.select("twitchAccess")
			.eq("responseId", userresponseId)
			.single();
		// console.log(AccessToken);
		if (AccessToken.data.twitchAccess == null) {
			var options = {
				method: "POST",
				url: "https://id.twitch.tv/oauth2/token",
				header: { "content-type": "application/x-www-form-urlencoded" },
				data: new URLSearchParams({
					grant_type: "authorization_code",
					client_id: `${clientId}`,
					client_secret: `${clientSecret}`,
					code: `${code}`,
					// need to determine what page the client wants to redirect to after auth
					redirect_uri: `${redirectUri}`,
				}),
			};
			await axios
				.request(options)
				.then(async function (response) {
					// console.log(response);
					// HERE WE WILL NEED TO STORE THE ACCESS AND REFRESH TOKEN IN THE DATABASE
					const { data, error } = await supabase
						.from("openloot")
						.update({
							twitchAccess: response.data.access_token,
							twitchRefresh: response.data.refresh_token,
						})
						.eq("responseId", userresponseId)
						.single();
					console.log(error);
					const newAccessToken = await supabase
						.from("openloot")
						.select("twitchAccess")
						.eq("responseId", userresponseId)
						.single();
					const options2 = {
						method: "GET",
						url: "https://id.twitch.tv/oauth2/validate",
						headers: {
							Authorization: `OAuth ${newAccessToken.data.twitchAccess}`,
						},
					};
					// HERE we validated the token given to us by twitch and stored the associated user id in the database
					await axios.request(options2).then(async function (response) {
						// console.log(response + "validate");
						await supabase
							.from("openloot")
							.update({ twitchuserId: response.data.user_id })
							.eq("responseId", userresponseId)
							.single();
						// await supabase
						//   .from("openloost")
						//   .update({ twitchBasic: response.data })
						//   .eq("responseId", userresponseId)
						//   .single();
						const client_id = "yk62ix6gpuplw5acj37vh5l06zjobw";
						const options3 = {
							method: "GET",
							url: "https://api.twitch.tv/helix/users",
							headers: {
								Authorization: `Bearer ${newAccessToken.data.twitchAccess}`,
								"Client-Id": `${client_id}`,
							},
							data: new URLSearchParams({
								id: `${response.data.user_id}`,
							}),
						};
						// HERE we made a request to twitch api go get the user and associated basic information
						await axios
							.request(options3)
							.then(async function (response) {
								// console.log(response.data.data);
								const str = response.data.data[0].description;
								const description = str.replace(/(\r\n|\n|\r)/gm, " ");
								const { data, error } = await supabase
									.from("openloot")
									.update({
										twitchURL:
											"twitch.tv/" + response.data.data[0].display_name,
										twitchviewCount: response.data.data[0].view_count,
										twitchDescription: description,
										twitchdisplayName: response.data.data[0].display_name,
										twitchbroadcasterType:
											response.data.data[0].broadcaster_type,
									})
									.eq("responseId", userresponseId)
									.single();
							})
							.catch(function (error) {
								console.log(error);
							});
						const getFollowers = {
							method: "GET",
							url: `https://api.twitch.tv/helix/users/follows?to_id=${response.data.user_id}`,
							headers: {
								Authorization: `Bearer ${newAccessToken.data.twitchAccess}`,
								"Client-Id": `${client_id}`,
							},
						};
						await axios
							.request(getFollowers)
							.then(async function (response) {
								// console.log(response.data);
								// console.log(response.data.total);
								await supabase
									.from("openloot")
									.update({ twitchFollowers: response.data.total })
									.eq("responseId", userresponseId)
									.single();
							})
							.catch(function (error) {
								console.log(error);
							});
					});
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	}
	getTwitchtoken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/tiktok", (req, res) => {
	const userresponseId = req.body.responseId;

	const code = req.body.code;
	async function getTikTokToken() {
		const clientKey = "awl3jaifictg61ra";
		const redirectUri = "https://ambassador.openloot.com/tiktok-auth";
		const clientSecret = tiktokClientSecret;
		const AccessToken = await supabase
			.from("openloot")
			.select("tiktokAccess")
			.eq("responseId", userresponseId)
			.single();
		if (AccessToken.data.tiktokAccess == null) {
			const getToken = {
				method: "POST",
				url: `https://open-api.tiktok.com/oauth/access_token/`,
				header: { "content-type": "application/x-www-form-urlencoded" },
				data: new URLSearchParams({
					grant_type: "authorization_code",
					client_key: `${clientKey}`,
					client_secret: `${clientSecret}`,
					code: `${code}`,
					redirect_uri: `${redirectUri}`,
					access_type: "offline",
				}),
			};
			await axios
				.request(getToken)
				.then(async function (response) {
					// console.log(response);
					await supabase
						.from("openloot")
						.update({
							tiktokAccess: response.data.data.access_token,
							tiktokRefresh: response.data.data.refresh_token,
							tiktokopenId: response.data.data.open_id,
						})
						.eq("responseId", req.body.responseId)
						.single();
				})
				.catch(function (error) {
					console.log(error);
				});

			// console.log(AccessToken);
			const newAccessToken = await supabase
				.from("openloot")
				.select("tiktokAccess")
				.eq("responseId", userresponseId)
				.single();
			const gettiktokUser = {
				method: "POST",
				url: `https://open-api.tiktok.com/user/info/`,
				headers: {
					"Content-Type": "application/json",
					// Authorization: `Bearer ${newAccessToken.data.tiktokAccess}`,
				},
				data: {
					fields: [
						"display_name",
						"open_id",
						"bio_description",
						"profile_deep_link",
					],
					access_token: `${newAccessToken.data.tiktokAccess}`,
				},
			};
			await axios
				.request(gettiktokUser)
				.then(async function (response) {
					// console.log(response.data.data);
					const str = response.data.data.user.description;
					const description = str.replace(/(\r\n|\n|\r)/gm, " ");
					const { data, error } = await supabase
						.from("openloot")
						.update({
							tiktokId: response.data.data.user.open_id,
							tiktokdisplayName: response.data.data.user.display_name,
							tiktokprofileLink: response.data.data.user.profile_deep_link,
							tiktokDescription: description,
						})
						.eq("responseId", userresponseId)
						.single();
					console.log(error);
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	}
	getTikTokToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/tiktokProfile", (req, res) => {
	const userresponseId = req.body.responseId;

	const code = req.body.code;
	async function getTikTokToken() {
		const clientKey = "awl3jaifictg61ra";
		const redirectUri = "https://ambassador.openloot.com/auth-page";
		const clientSecret = tiktokClientSecret;
		const AccessToken = await supabase
			.from("openloot")
			.select("tiktokAccess")
			.eq("responseId", userresponseId)
			.single();
		const getToken = {
			method: "POST",
			url: `https://open-api.tiktok.com/oauth/access_token/`,
			header: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "authorization_code",
				client_key: `${clientKey}`,
				client_secret: `${clientSecret}`,
				code: `${code}`,
				redirect_uri: `${redirectUri}`,
				access_type: "offline",
			}),
		};
		await axios
			.request(getToken)
			.then(async function (response) {
				// console.log(response);
				await supabase
					.from("openloot")
					.update({
						tiktokAccess: response.data.data.access_token,
						tiktokRefresh: response.data.data.refresh_token,
						tiktokopenId: response.data.data.open_id,
					})
					.eq("responseId", req.body.responseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});

		// console.log(AccessToken);
		const newAccessToken = await supabase
			.from("openloot")
			.select("tiktokAccess")
			.eq("responseId", userresponseId)
			.single();
		const gettiktokUser = {
			method: "POST",
			url: `https://open-api.tiktok.com/user/info/`,
			headers: {
				"Content-Type": "application/json",
				// Authorization: `Bearer ${newAccessToken.data.tiktokAccess}`,
			},
			data: {
				fields: [
					"display_name",
					"open_id",
					"bio_description",
					"profile_deep_link",
				],
				access_token: `${newAccessToken.data.tiktokAccess}`,
			},
		};
		await axios
			.request(gettiktokUser)
			.then(async function (response) {
				// console.log(response.data.data);
				const str = response.data.data.user.description;
				const description = str.replace(/(\r\n|\n|\r)/gm, " ");
				const { data, error } = await supabase
					.from("openloot")
					.update({
						tiktokId: response.data.data.user.open_id,
						tiktokdisplayName: response.data.data.user.display_name,
						tiktokprofileLink: response.data.data.user.profile_deep_link,
						tiktokDescription: description,
					})
					.eq("responseId", userresponseId)
					.single();
				console.log(error);
			})
			.catch(function (error) {
				console.log(error);
			});
	}
	getTikTokToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/tiktokDashboard", (req, res) => {
	const userresponseId = req.body.responseId;

	const code = req.body.code;
	async function getTikTokToken() {
		const clientKey = "awl3jaifictg61ra";
		const redirectUri = "https://ambassador.openloot.com/dashboard";
		const clientSecret = tiktokClientSecret;
		const AccessToken = await supabase
			.from("openloot")
			.select("tiktokAccess")
			.eq("responseId", userresponseId)
			.single();
		const getToken = {
			method: "POST",
			url: `https://open-api.tiktok.com/oauth/access_token/`,
			header: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "authorization_code",
				client_key: `${clientKey}`,
				client_secret: `${clientSecret}`,
				code: `${code}`,
				redirect_uri: `${redirectUri}`,
				access_type: "offline",
			}),
		};
		await axios
			.request(getToken)
			.then(async function (response) {
				// console.log(response);
				await supabase
					.from("openloot")
					.update({
						tiktokAccess: response.data.data.access_token,
						tiktokRefresh: response.data.data.refresh_token,
						tiktokopenId: response.data.data.open_id,
					})
					.eq("responseId", req.body.responseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});

		// console.log(AccessToken);
		const newAccessToken = await supabase
			.from("openloot")
			.select("tiktokAccess")
			.eq("responseId", userresponseId)
			.single();
		const gettiktokUser = {
			method: "POST",
			url: `https://open-api.tiktok.com/user/info/`,
			headers: {
				"Content-Type": "application/json",
				// Authorization: `Bearer ${newAccessToken.data.tiktokAccess}`,
			},
			data: {
				fields: [
					"display_name",
					"open_id",
					"bio_description",
					"profile_deep_link",
				],
				access_token: `${newAccessToken.data.tiktokAccess}`,
			},
		};
		await axios
			.request(gettiktokUser)
			.then(async function (response) {
				// console.log(response.data.data);
				const str = response.data.data.user.description;
				const description = str.replace(/(\r\n|\n|\r)/gm, " ");
				const { data, error } = await supabase
					.from("openloot")
					.update({
						tiktokId: response.data.data.user.open_id,
						tiktokdisplayName: response.data.data.user.display_name,
						tiktokprofileLink: response.data.data.user.profile_deep_link,
						tiktokDescription: description,
					})
					.eq("responseId", userresponseId)
					.single();
				console.log(error);
			})
			.catch(function (error) {
				console.log(error);
			});
	}
	getTikTokToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/discord", (req, res) => {
	const code = req.body.code;
	async function getDiscordToken() {
		const clientId = "1009523640901058632";
		const redirectUri = "https://ambassador.openloot.com/discord-auth";
		const clientSecret = "SvAp3DUxhRxszkufX4EjeOdY_aNJrSbS";
		const userresponseId = req.body.responseId;
		const AccessToken = await supabase
			.from("openloot")
			.select("discordAccess")
			.eq("responseId", userresponseId)
			.single();
		if (AccessToken.data.discordAccess == null) {
			const getToken = {
				method: "POST",
				url: "https://discord.com/api/oauth2/token",
				headers: { "content-type": "application/x-www-form-urlencoded" },
				data: new URLSearchParams({
					grant_type: "authorization_code",
					client_id: `${clientId}`,
					client_secret: `${clientSecret}`,
					code: `${code}`,
					redirect_uri: `${redirectUri}`,
					access_type: "offline",
				}),
			};
			await axios
				.request(getToken)
				.then(async function (response) {
					// console.log(response);
					await supabase
						.from("openloot")
						.update({
							discordAccess: response.data.access_token,
							discordRefresh: response.data.refresh_token,
						})
						.eq("responseId", userresponseId)
						.single();
				})
				.catch(function (error) {
					console.log(error);
				});
			const newAccessToken = await supabase
				.from("openloot")
				.select("discordAccess")
				.eq("responseId", userresponseId)
				.single();
			const getDiscordBasic = {
				method: "GET",
				url: "https://discord.com/api/users/@me?scope=email",
				headers: {
					Authorization: `Bearer ${newAccessToken.data.discordAccess}`,
					"content-type": "application/x-www-form-urlencoded",
				},
			};
			await axios
				.request(getDiscordBasic)
				.then(async function (response) {
					// console.log(response);
					await supabase
						.from("openloot")
						.update({
							discordId: response.data.id,
							discordUsername: response.data.username,
							discordEmail: response.data.email,
							discordVerified: response.data.verified,
						})
						.eq("responseId", userresponseId)
						.single();
				})
				.catch(function (error) {
					console.log(error);
				});
			const getDiscordGuild = {
				method: "GET",
				url: "https://discord.com/api/users/@me/guilds",
				headers: {
					Authorization: `Bearer ${newAccessToken.data.discordAccess}`,
				},
			};
			await axios
				.request(getDiscordGuild)
				.then(async function (response) {
					// console.log(response.data);
					const Guilds = [];
					for (let i = 0; i < response.data.length; i++) {
						Guilds.push(response.data[i].name);
					}
					// console.log(Guilds);
					await supabase
						.from("openloot")
						.update({
							discordGuilds: Guilds,
						})
						.eq("responseId", userresponseId)
						.single();
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	}
	getDiscordToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/discordProfile", (req, res) => {
	const code = req.body.code;
	async function getDiscordToken() {
		const clientId = "1009523640901058632";
		const redirectUri = "https://ambassador.openloot.com/auth-page";
		const clientSecret = "SvAp3DUxhRxszkufX4EjeOdY_aNJrSbS";
		const userresponseId = req.body.responseId;
		const AccessToken = await supabase
			.from("openloot")
			.select("discordAccess")
			.eq("responseId", userresponseId)
			.single();
		const getToken = {
			method: "POST",
			url: "https://discord.com/api/oauth2/token",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "authorization_code",
				client_id: `${clientId}`,
				client_secret: `${clientSecret}`,
				code: `${code}`,
				redirect_uri: `${redirectUri}`,
				access_type: "offline",
			}),
		};
		await axios
			.request(getToken)
			.then(async function (response) {
				// console.log(response);
				await supabase
					.from("openloot")
					.update({
						discordAccess: response.data.access_token,
						discordRefresh: response.data.refresh_token,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
		const newAccessToken = await supabase
			.from("openloot")
			.select("discordAccess")
			.eq("responseId", userresponseId)
			.single();
		const getDiscordBasic = {
			method: "GET",
			url: "https://discord.com/api/users/@me?scope=email",
			headers: {
				Authorization: `Bearer ${newAccessToken.data.discordAccess}`,
				"content-type": "application/x-www-form-urlencoded",
			},
		};
		await axios
			.request(getDiscordBasic)
			.then(async function (response) {
				// console.log(response);
				await supabase
					.from("openloot")
					.update({
						discordId: response.data.id,
						discordUsername: response.data.username,
						discordEmail: response.data.email,
						discordVerified: response.data.verified,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
		const getDiscordGuild = {
			method: "GET",
			url: "https://discord.com/api/users/@me/guilds",
			headers: {
				Authorization: `Bearer ${newAccessToken.data.discordAccess}`,
			},
		};
		await axios
			.request(getDiscordGuild)
			.then(async function (response) {
				// console.log(response.data);
				const Guilds = [];
				for (let i = 0; i < response.data.length; i++) {
					Guilds.push(response.data[i].name);
				}
				// console.log(Guilds);
				await supabase
					.from("openloot")
					.update({
						discordGuilds: Guilds,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
	}
	getDiscordToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/discordDashboard", (req, res) => {
	const code = req.body.code;
	async function getDiscordToken() {
		const clientId = "1009523640901058632";
		const redirectUri = "https://ambassador.openloot.com/dashboard";
		const clientSecret = "SvAp3DUxhRxszkufX4EjeOdY_aNJrSbS";
		const userresponseId = req.body.responseId;
		const AccessToken = await supabase
			.from("openloot")
			.select("discordAccess")
			.eq("responseId", userresponseId)
			.single();
		const getToken = {
			method: "POST",
			url: "https://discord.com/api/oauth2/token",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "authorization_code",
				client_id: `${clientId}`,
				client_secret: `${clientSecret}`,
				code: `${code}`,
				redirect_uri: `${redirectUri}`,
				access_type: "offline",
			}),
		};
		await axios
			.request(getToken)
			.then(async function (response) {
				// console.log(response);
				await supabase
					.from("openloot")
					.update({
						discordAccess: response.data.access_token,
						discordRefresh: response.data.refresh_token,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
		const newAccessToken = await supabase
			.from("openloot")
			.select("discordAccess")
			.eq("responseId", userresponseId)
			.single();
		const getDiscordBasic = {
			method: "GET",
			url: "https://discord.com/api/users/@me?scope=email",
			headers: {
				Authorization: `Bearer ${newAccessToken.data.discordAccess}`,
				"content-type": "application/x-www-form-urlencoded",
			},
		};
		await axios
			.request(getDiscordBasic)
			.then(async function (response) {
				// console.log(response);
				await supabase
					.from("openloot")
					.update({
						discordId: response.data.id,
						discordUsername: response.data.username,
						discordEmail: response.data.email,
						discordVerified: response.data.verified,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
		const getDiscordGuild = {
			method: "GET",
			url: "https://discord.com/api/users/@me/guilds",
			headers: {
				Authorization: `Bearer ${newAccessToken.data.discordAccess}`,
			},
		};
		await axios
			.request(getDiscordGuild)
			.then(async function (response) {
				// console.log(response.data);
				const Guilds = [];
				for (let i = 0; i < response.data.length; i++) {
					Guilds.push(response.data[i].name);
				}
				// console.log(Guilds);
				await supabase
					.from("openloot")
					.update({
						discordGuilds: Guilds,
					})
					.eq("responseId", userresponseId)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
	}
	getDiscordToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
// HERE is the post request accepted from frontend to run the basic youtube capture such as user description etc.
app.post("/youtube", (req, res) => {
	const code = req.body.code;
	async function getYoutubeToken() {
		const clientId = googleClientId;
		const redirectUri = "https://ambassador.openloot.com/youtube-auth";
		const clientSecret = googleClientSecret;
		const userresponseId = req.body.responseId;
		// console.log(userresponseId);
		const AccessToken = await supabase
			.from("openloot")
			.select("youtubeAccess")
			.eq("responseId", userresponseId)
			.single();
		// console.log(AccessToken);

		if (AccessToken.data.youtubeAccess == null) {
			const getToken = {
				method: "POST",
				url: "https://accounts.google.com/o/oauth2/token",
				header: { "content-type": "application/x-www-form-urlencoded" },
				data: new URLSearchParams({
					grant_type: "authorization_code",
					client_id: `${clientId}`,
					client_secret: `${clientSecret}`,
					code: `${code}`,
					redirect_uri: `${redirectUri}`,
					access_type: "offline",
				}),
			};
			await axios
				.request(getToken)
				.then(async function (response) {
					// console.log(response);
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
			const getyoutubeId = {
				method: "GET",
				url: `https://youtube.googleapis.com/youtube/v3/channels?client_id=${clientId}&part=snippet%2CcontentDetails%2Cstatistics&mine=true`,
				headers: {
					Authorization: `Bearer ${newAccessToken.data.youtubeAccess}`,
					"content-type": "application/x-www-form-urlencoded",
				},
			};
			await axios
				.request(getyoutubeId)
				.then(async function (response) {
					for (let i = 0; i < response.data.items.length; i++) {
						const str = response.data.items[i].snippet.localized.description;
						const description = str.replace(/(\r\n|\n|\r)/gm, " ");
						await supabase
							.from("openloot")
							.update({
								youtubeURL:
									"https://www.youtube.com/c/" + response.data.items[i].id,
								youtubesubscriberCount:
									response.data.items[i].statistics.subscriberCount,
								youtubeviewCount: response.data.items[i].statistics.viewCount,
								youtubeId: response.data.items[i].id,
								youtubeDescription: description,
							})
							.eq("responseId", userresponseId)
							.single();
					}
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	}

	getYoutubeToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/youtubeProfile", (req, res) => {
	const code = req.body.code;
	async function getYoutubeToken() {
		const clientId = youtubeClientId;
		const redirectUri = "https://ambassador.openloot.com/auth-page";
		const clientSecret = youtubeClientSecret;
		const userresponseId = req.body.responseId;
		// console.log(userresponseId);
		const AccessToken = await supabase
			.from("openloot")
			.select("youtubeAccess")
			.eq("responseId", userresponseId)
			.single();

		const getToken = {
			method: "POST",
			url: "https://accounts.google.com/o/oauth2/token",
			header: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "authorization_code",
				client_id: `${clientId}`,
				client_secret: `${clientSecret}`,
				code: `${code}`,
				redirect_uri: `${redirectUri}`,
				access_type: "offline",
			}),
		};
		await axios
			.request(getToken)
			.then(async function (response) {
				// console.log(response);
				const { data, error } = await supabase
					.from("openloot")
					.update({
						youtubeAccess: response.data.access_token,
						youtubeRefresh: response.data.refresh_token,
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
			.select("youtubeAccess")
			.eq("responseId", userresponseId)
			.single();
		const getyoutubeId = {
			method: "GET",
			url: `https://youtube.googleapis.com/youtube/v3/channels?client_id=${clientId}&part=snippet%2CcontentDetails%2Cstatistics&mine=true`,
			headers: {
				Authorization: `Bearer ${newAccessToken.data.youtubeAccess}`,
				"content-type": "application/x-www-form-urlencoded",
			},
		};
		await axios
			.request(getyoutubeId)
			.then(async function (response) {
				for (let i = 0; i < response.data.items.length; i++) {
					const str = response.data.items[i].snippet.localized.description;
					const description = str.replace(/(\r\n|\n|\r)/gm, " ");
					await supabase
						.from("openloot")
						.update({
							youtubeURL:
								"https://www.youtube.com/c/" + response.data.items[i].id,
							youtubesubscriberCount:
								response.data.items[i].statistics.subscriberCount,
							youtubeviewCount: response.data.items[i].statistics.viewCount,
							youtubeId: response.data.items[i].id,
							youtubeDescription: description,
						})
						.eq("responseId", userresponseId)
						.single();
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	getYoutubeToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/youtubeDashboard", (req, res) => {
	const code = req.body.code;
	async function getYoutubeToken() {
		const clientId = youtubeClientId;
		const redirectUri = "https://ambassador.openloot.com/dashboard";
		const clientSecret = youtubeClientSecret;
		const userresponseId = req.body.responseId;
		// console.log(userresponseId);
		const AccessToken = await supabase
			.from("openloot")
			.select("youtubeAccess")
			.eq("responseId", userresponseId)
			.single();

		const getToken = {
			method: "POST",
			url: "https://accounts.google.com/o/oauth2/token",
			header: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "authorization_code",
				client_id: `${clientId}`,
				client_secret: `${clientSecret}`,
				code: `${code}`,
				redirect_uri: `${redirectUri}`,
				access_type: "offline",
			}),
		};
		await axios
			.request(getToken)
			.then(async function (response) {
				// console.log(response);
				const { data, error } = await supabase
					.from("openloot")
					.update({
						youtubeAccess: response.data.access_token,
						youtubeRefresh: response.data.refresh_token,
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
			.select("youtubeAccess")
			.eq("responseId", userresponseId)
			.single();
		const getyoutubeId = {
			method: "GET",
			url: `https://youtube.googleapis.com/youtube/v3/channels?client_id=${clientId}&part=snippet%2CcontentDetails%2Cstatistics&mine=true`,
			headers: {
				Authorization: `Bearer ${newAccessToken.data.youtubeAccess}`,
				"content-type": "application/x-www-form-urlencoded",
			},
		};
		await axios
			.request(getyoutubeId)
			.then(async function (response) {
				for (let i = 0; i < response.data.items.length; i++) {
					const str = response.data.items[i].snippet.localized.description;
					const description = str.replace(/(\r\n|\n|\r)/gm, " ");
					await supabase
						.from("openloot")
						.update({
							youtubeURL:
								"https://www.youtube.com/c/" + response.data.items[i].id,
							youtubesubscriberCount:
								response.data.items[i].statistics.subscriberCount,
							youtubeviewCount: response.data.items[i].statistics.viewCount,
							youtubeId: response.data.items[i].id,
							youtubeDescription: description,
						})
						.eq("responseId", userresponseId)
						.single();
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	getYoutubeToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
// HERE is the post request accepted from the frontend to run the basic twitter user information capture.
app.post("/twitter", (req, res) => {
	// console.log(req.body);
	async function getTwitterToken() {
		const userresponseId = req.body.responseId;
		const code = req.body.code;
		// HERE we will create a bigquery row using the response id

		const AccessToken = await supabase
			.from("openloot")
			.select("twitterAccess")
			.eq("responseId", `${userresponseId}`)
			.single();
		// HERE we are making the call to the twitch api to get the twitch Access and twitch Refresh tokens which are stored into supabase openloot table.

		const userclientId = "UDJZRzBxMGZ4bWEtSDlQTWE1N2g6MTpjaQ";
		if (AccessToken.data.twitterAccess == null) {
			var options = {
				method: "POST",
				url: "https://api.twitter.com/2/oauth2/token?access_type=offline",
				header: {
					"content-type": "application/x-www-form-urlencoded",
					Client_Id: `${userclientId}`,
				},
				data: new URLSearchParams({
					access_type: "offline",
					grant_type: "authorization_code",
					client_id: `${userclientId}`,
					code: `${code}`,
					redirect_uri: "https://ambassador.openloot.com/twitter-auth/",
					code_verifier: "challenge",
				}),
			};
			await axios
				.request(options)
				.then(async function (response) {
					// console.log(response);
					// HERE WE WILL NEED TO STORE THE ACCESS AND REFRESH TOKEN IN THE DATABASE
					await supabase
						.from("openloot")
						.update({
							twitterAccess: response.data.access_token,
							twitterRefresh: response.data.refresh_token,
						})
						.eq("responseId", `${userresponseId}`)
						.single();
				})
				.catch(function (error) {
					console.log(error);
				});
		}
		const newAccessToken = await supabase
			.from("openloot")
			.select("twitterAccess")
			.eq("responseId", userresponseId)
			.single();
		const getuserData = {
			method: "GET",
			url: "https://api.twitter.com/2/users/me?user.fields=id,username,description,verified,public_metrics,url,name,created_at",
			headers: {
				Authorization: `Bearer ${newAccessToken.data.twitterAccess}`,
			},
		};
		await axios
			.request(getuserData)
			.then(async function (response) {
				const str = response.data.data.description;
				const description = str.replace(/(\r\n|\n|\r)/gm, " ");
				await supabase
					.from("openloot")
					.update({
						twitterfollowerCount:
							response.data.data.public_metrics.followers_count,
						twitterDescription: description,
						twitterVerified: response.data.data.verified,
						twitterUsername: response.data.data.username,
						twitterId: response.data.data.id,
						twitterName: response.data.data.name,
						twitterURL: "https://twitter.com/" + response.data.data.username,
					})
					.eq("responseId", `${userresponseId}`)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	getTwitterToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/twitterProfile", (req, res) => {
	// console.log(req.body);
	async function getTwitterToken() {
		const userresponseId = req.body.responseId;
		const code = req.body.code;
		// HERE we will create a bigquery row using the response id
		// HERE we are making the call to the twitch api to get the twitch Access and twitch Refresh tokens which are stored into supabase openloot table.

		const userclientId = "UDJZRzBxMGZ4bWEtSDlQTWE1N2g6MTpjaQ";
		var options = {
			method: "POST",
			url: "https://api.twitter.com/2/oauth2/token?access_type=offline",
			header: {
				"content-type": "application/x-www-form-urlencoded",
				Client_Id: `${userclientId}`,
			},
			data: new URLSearchParams({
				access_type: "offline",
				grant_type: "authorization_code",
				client_id: `${userclientId}`,
				code: `${code}`,
				redirect_uri: "https://ambassador.openloot.com/twitter-auth/",
				code_verifier: "challenge",
			}),
		};
		await axios
			.request(options)
			.then(async function (response) {
				// console.log(response);
				// HERE WE WILL NEED TO STORE THE ACCESS AND REFRESH TOKEN IN THE DATABASE
				await supabase
					.from("openloot")
					.update({
						twitterAccess: response.data.access_token,
						twitterRefresh: response.data.refresh_token,
					})
					.eq("responseId", `${userresponseId}`)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});

		const newAccessToken = await supabase
			.from("openloot")
			.select("twitterAccess")
			.eq("responseId", userresponseId)
			.single();
		const getuserData = {
			method: "GET",
			url: "https://api.twitter.com/2/users/me?user.fields=id,username,description,verified,public_metrics,url,name,created_at",
			headers: {
				Authorization: `Bearer ${newAccessToken.data.twitterAccess}`,
			},
		};
		await axios
			.request(getuserData)
			.then(async function (response) {
				const str = response.data.data.description;
				const description = str.replace(/(\r\n|\n|\r)/gm, " ");
				await supabase
					.from("openloot")
					.update({
						twitterfollowerCount:
							response.data.data.public_metrics.followers_count,
						twitterDescription: description,
						twitterVerified: response.data.data.verified,
						twitterUsername: response.data.data.username,
						twitterId: response.data.data.id,
						twitterName: response.data.data.name,
						twitterURL: "https://twitter.com/" + response.data.data.username,
					})
					.eq("responseId", `${userresponseId}`)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	getTwitterToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});
app.post("/twitterDashboard", (req, res) => {
	// console.log(req.body);
	async function getTwitterToken() {
		const userresponseId = req.body.responseId;
		const code = req.body.code;
		// HERE we will create a bigquery row using the response id
		// HERE we are making the call to the twitch api to get the twitch Access and twitch Refresh tokens which are stored into supabase openloot table.

		const userclientId = "UDJZRzBxMGZ4bWEtSDlQTWE1N2g6MTpjaQ";
		var options = {
			method: "POST",
			url: "https://api.twitter.com/2/oauth2/token?access_type=offline",
			header: {
				"content-type": "application/x-www-form-urlencoded",
				Client_Id: `${userclientId}`,
			},
			data: new URLSearchParams({
				access_type: "offline",
				grant_type: "authorization_code",
				client_id: `${userclientId}`,
				code: `${code}`,
				redirect_uri: "https://ambassador.openloot.com/twitter-auth/",
				code_verifier: "challenge",
			}),
		};
		await axios
			.request(options)
			.then(async function (response) {
				// console.log(response);
				// HERE WE WILL NEED TO STORE THE ACCESS AND REFRESH TOKEN IN THE DATABASE
				await supabase
					.from("openloot")
					.update({
						twitterAccess: response.data.access_token,
						twitterRefresh: response.data.refresh_token,
					})
					.eq("responseId", `${userresponseId}`)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});

		const newAccessToken = await supabase
			.from("openloot")
			.select("twitterAccess")
			.eq("responseId", userresponseId)
			.single();
		const getuserData = {
			method: "GET",
			url: "https://api.twitter.com/2/users/me?user.fields=id,username,description,verified,public_metrics,url,name,created_at",
			headers: {
				Authorization: `Bearer ${newAccessToken.data.twitterAccess}`,
			},
		};
		await axios
			.request(getuserData)
			.then(async function (response) {
				const str = response.data.data.description;
				const description = str.replace(/(\r\n|\n|\r)/gm, " ");
				await supabase
					.from("openloot")
					.update({
						twitterfollowerCount:
							response.data.data.public_metrics.followers_count,
						twitterDescription: description,
						twitterVerified: response.data.data.verified,
						twitterUsername: response.data.data.username,
						twitterId: response.data.data.id,
						twitterName: response.data.data.name,
						twitterURL: "https://twitter.com/" + response.data.data.username,
					})
					.eq("responseId", `${userresponseId}`)
					.single();
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	getTwitterToken();
	res.writeHead(200, { "Content-Type": "text/plain" });
});

app.listen(port);

console.log(
	[
		`The server has started on http://localhost:${port}!`,
		"You can render a video by passing props as URL parameters.",
		"",
		"If you are running Hello World, try this:",
		"",
		`http://localhost:${port}`,
		"",
	].join("\n")
);
