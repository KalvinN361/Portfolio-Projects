// const axios = require("axios");
const axios = require("axios");
// import supabase from "supabase";
const { createClient } = require("@supabase/supabase-js");

const DATABASE_URL = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const SUPABASE_SERVICE_API_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDc5OTgzMDEsImV4cCI6MTk2MzU3NDMwMX0.h5JPY4tOUZxbBEdAegnYcs35hpdZGt80vCXep5daWAs";
const supabase = createClient(DATABASE_URL, SUPABASE_SERVICE_API_KEY);
const twitchclientId = "yk62ix6gpuplw5acj37vh5l06zjobw";
const twitterclientId = "UDJZRzBxMGZ4bWEtSDlQTWE1N2g6MTpjaQ";
const youtubeclientId =
	"109739013430-07r0sf26hduocuaoqjf0rmt9ofutlqg2.apps.googleusercontent.com";
const discordclientId = "1009523640901058632";
const tiktokclientKey = "awl3jaifictg61ra";
const userresponseId = localStorage.getItem("responseId");
// checks local storage for account email
const accountEmail = localStorage.getItem("email");

async function legacy() {
	// Get userresponseId from local storage
	let userresponseId = localStorage.getItem("responseId");
	// checks to make sure that the accountEmail variable is not null
	if (accountEmail != null) {
		// HERE we are grabbing the email field in supabase where email is equal to the accountEmail variable
		const { data: sbData, error } = await supabase
			.from("openloot")
			.select("email")
			.eq("email", accountEmail)
			.single();
		// HERE we are checking to see if the email || sbdata is null
		if (userresponseId == null && sbData == null) {
			const characters =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			// HERE we are creating a random string of 10 characters
			const first = Math.random().toString(36).substring(2, 27);
			// HERE we are creating a random string of 10 characters
			const seconds = Math.random().toString(36).substring(2, 27);
			// HERE we are combining the two random strings into one variable randomNumber
			const randomNumber = first + seconds;
			// HERE we are storing the random number i the local storage as responseId
			localStorage.setItem("responseId", randomNumber);
			// HERE we are inserting a row into supabase with the email and responseId and then reloading the page
			const { data, error } = await supabase
				.from("openloot")
				.insert([{ email: accountEmail, responseId: randomNumber }]);
			window.location.reload();
		}
		// HERE we are checking to see if responseId is null and sbData is not null
		if (userresponseId == null && sbData != null) {
			const { data: sbDataNew, error } = await supabase
				.from("openloot")
				.select("*")
				.eq("email", accountEmail)
				.single();
			localStorage.setItem("responseId", sbDataNew.responseId);
		}
	}
}
async function loadStatus() {
	// HERE we are retrieving the responseId from local storage
	const userresponseId = localStorage.getItem("responseId");
	// HERE we are getting username/displayName from supabase where the responseId is equal to the userresponseId
	const { data: sbusernameData, error } = await supabase
		.from("openloot")
		.select(
			"twitchdisplayName, twitterUsername, youtubeId, discordUsername, tiktokdisplayName"
		)
		.eq("responseId", userresponseId)
		.single();
	// console.log(sbusernameData)
	// HERE we are checking if the username/display name is not null and then displaying the username/display name else we are displaying "Not Connected"
	if (sbusernameData.twitchdisplayName != null) {
		document.getElementById(
			"twitchStatus"
		).innerHTML = `${sbusernameData.twitchdisplayName}`;
	} else {
		document.getElementById("twitchStatus").innerHTML = "Not Connected";
		// document.getElementById("twitchConnect").innerHTML = "Connect";
	}
	if (sbusernameData.twitterUsername != null) {
		document.getElementById(
			"twitterStatus"
		).innerHTML = `${sbusernameData.twitterUsername}`;
	} else {
		document.getElementById("twitterStatus").innerHTML = "Not Connected";
		// document.getElementById("twitterConnect").innerHTML = "Connect";
	}

	if (sbusernameData.youtubeId != null) {
		document.getElementById(
			"youtubeStatus"
		).innerHTML = `${sbusernameData.youtubeId}`;
	} else {
		document.getElementById("youtubeStatus").innerHTML = "Not Connected";
		// document.getElementById("youtubeConnect").innerHTML = "Connect";
	}
	if (sbusernameData.discordUsername != null) {
		document.getElementById(
			"discordStatus"
		).innerHTML = `${sbusernameData.discordUsername}`;
	} else {
		document.getElementById("discordStatus").innerHTML = "Not Connected";
		// document.getElementById("discordConnect").innerHTML = "Connect";
	}
	if (sbusernameData.tiktokdisplayName != null) {
		document.getElementById(
			"tiktokStatus"
		).innerHTML = `${sbusernameData.tiktokdisplayName}`;
	} else {
		document.getElementById("tiktokStatus").innerHTML = "Not Connected";
		// document.getElementById("tiktokConnect").innerHTML = "Connect";
	}
}

async function twitchAuth() {
	// HERE an access token is received so that we can create a conditional to check for user access token so that the function does not run repeatedly.
	const authUrl =
		"https://id.twitch.tv/oauth2/authorize" +
		`?response_type=code` +
		`&client_id=${encodeURIComponent("yk62ix6gpuplw5acj37vh5l06zjobw")}` +
		`&redirect_uri=${encodeURIComponent(
			"https://ambassador.openloot.com/dashboard"
		)}` +
		`&scope=channel:read:subscriptions+user:read:broadcast+user:read:email` +
		`&state=1998` +
		`&force_verify=true`;
	let userresponseId = localStorage.getItem("responseId");

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl + "&output=embed";
}
async function twitterAuth() {
	const authUrl =
		"https://twitter.com/i/oauth2/authorize" +
		`?response_type=code` +
		`&client_id=${encodeURIComponent("UDJZRzBxMGZ4bWEtSDlQTWE1N2g6MTpjaQ")}` +
		`&redirect_uri=${encodeURIComponent(
			"https://ambassador.openloot.com/twitter-auth/"
		)}` +
		`&scope=tweet.read%20users.read%20follows.read%20follows.write%20offline.access` +
		`&state=super` +
		`&code_challenge=challenge` +
		`&code_challenge_method=plain` +
		`&force_login=true`;

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl;
}
async function youtubeAuth() {
	const clientId =
		"109739013430-07r0sf26hduocuaoqjf0rmt9ofutlqg2.apps.googleusercontent.com";
	const redirectUri = "https://ambassador.openloot.com/dashboard";
	const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/youtube&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=${redirectUri}&response_type=code&client_id=${clientId}&prompt=consent`;

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl;
}

async function discordAuth() {
	const clientId = "1009523640901058632";
	const redirectUri = "https://ambassador.openloot.com/dashboard";
	const scopes = "activities.read,email,identify";
	const authUrl = `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${clientId}&state=246810&scope=email%20identify&redirect_uri=${redirectUri}&prompt=consent`;

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl;
}
async function tiktokAuth() {
	const csrfState = Math.random().toString(36).substring(2);

	const authUrl =
		"https://www.tiktok.com/auth/authorize/" +
		`?client_key=awl3jaifictg61ra` +
		`&scope=user.info.basic,video.list` +
		`&response_type=code` +
		`&redirect_uri=${encodeURIComponent(
			"https://ambassador.openloot.com/dashboard"
		)}` +
		`&state=${csrfState}`;

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl;
}
async function sendTwitchCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		// HERE we are sending the code through a post request to the backend api server
		await axios.post("https://api-xdws3nxmia-uc.a.run.app/twitchProfile", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
	window.location.href = "https://ambassador.openloot.com/dashboard";
}
async function sendTwitterCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		// HERE we are sending the code through a post request to the backend api server

		await axios.post("https://api-xdws3nxmia-uc.a.run.app/twitter", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
	// window.location.href = "https://ambassador.openloot.com/dashboard";
}
async function sendYoutubeCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		// HERE we are sending the code through a post request to the backend api server

		await axios.post("https://api-xdws3nxmia-uc.a.run.app/youtubeProfile", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
	window.location.href = "https://ambassador.openloot.com/dashboard";
}
async function sendDiscordCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		// HERE we are sending the code through a post request to the backend api server

		await axios.post("https://api-xdws3nxmia-uc.a.run.app/discordProfile", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
	window.location.href = "https://ambassador.openloot.com/dashboard";
}
async function sendTiktokCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		// HERE we are sending the code through a post request to the backend api server

		await axios.post("https://api-xdws3nxmia-uc.a.run.app/tiktokProfile", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
	window.location.href = "https://ambassador.openloot.com/dashboard";
}

document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "twitchConnect") {
		twitchAuth();
	}
});
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "twitterConnect") {
		twitterAuth();
	}
});
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "youtubeConnect") {
		youtubeAuth();
	}
});
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "discordConnect") {
		discordAuth();
	}
});
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "tiktokConnect") {
		tiktokAuth();
	}
});

window.onload = function () {
	legacy();
	// HERE I set a timeout to delay the load of the page as we have to give a couple of second for supabase to update correctly
	setTimeout(loadStatus, 2200);
	const twitchExectuted = false;
	const twitterExectuted = false;
	const youtubeExectuted = false;
	const discordExectuted = false;
	const tiktokExectuted = false;
	if (
		window.location.href.indexOf("code") > -1 &&
		twitchExectuted === false &&
		window.location.href.indexOf(
			"channel%3Aread%3Asubscriptions+user%3Aread%3Abroadcast+user%3Aread%3Aemail"
		) > -1
	) {
		sendTwitchCode();
		twitchExectuted = true;
		// window.location.href = "https://ambassador.openloot.com/dashboard";
	} else if (
		window.location.href.indexOf("code") > -1 &&
		twitterExectuted === false &&
		window.location.href.indexOf("super") > -1
	) {
		sendTwitterCode();
		twitterExectuted = true;
		window.location.href = "https://ambassador.openloot.com/dashboard";
	} else if (
		window.location.href.indexOf("code") > -1 &&
		youtubeExectuted === false &&
		window.location.href.indexOf("https://www.googleapis.com/auth/youtube") > -1
	) {
		sendYoutubeCode();
		youtubeExectuted = true;

		// window.location.href = "https://ambassador.openloot.com/dashboard";
	} else if (
		window.location.href.indexOf("code") > -1 &&
		discordExectuted === false &&
		window.location.href.indexOf("246810") > -1
	) {
		sendDiscordCode();
		discordExectuted = true;
		// window.location.href = "https://ambassador.openloot.com/dashboard";
	} else if (
		window.location.href.indexOf("code") > -1 &&
		tiktokExectuted === false &&
		window.location.href.indexOf("user.info.basic%2Cvideo.list") > -1
	) {
		sendTiktokCode();
		tiktokExectuted = true;

		// window.location.href = "https://ambassador.openloot.com/dashboard";
	}
};
