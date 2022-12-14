// const axios = require("axios");
const axios = require("axios");
// import supabase from "supabase";
const { createClient } = require("@supabase/supabase-js");

const DATABASE_URL = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const SUPABASE_SERVICE_API_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDI2NDc4OCwiZXhwIjoxOTg1ODQwNzg4fQ.7GEz9VZimvl44MZnelNMyXjmSEPXDnme6-9YX9d2z8g";
const supabase = createClient(DATABASE_URL, SUPABASE_SERVICE_API_KEY);

async function twitterAuth() {
	const authUrl =
		"https://twitter.com/i/oauth2/authorize" +
		`?response_type=code` +
		`&client_id=${encodeURIComponent("UDJZRzBxMGZ4bWEtSDlQTWE1N2g6MTpjaQ")}` +
		`&redirect_uri=${encodeURIComponent(
			"https://ambassador.openloot.com/twitter-auth/"
		)}` +
		`&scope=tweet.read%20users.read%20follows.read%20follows.write%20offline.access` +
		`&state=base` +
		`&code_challenge=challenge` +
		`&code_challenge_method=plain`;

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl;
}
async function sendCode() {
	let userresponseId = localStorage.getItem("responseId");
	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		await axios.post("https://server-e4bkq5wbca-uc.a.run.app/twitterProfile", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
}
async function sendTwitterCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		await axios.post("https://server-e4bkq5wbca-uc.a.run.app/twitter", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
}
async function sendTwitterCodeDashboard() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		await axios.post(
			"https://server-e4bkq5wbca-uc.a.run.app/twitterDashboard",
			{
				code: `${code}`,
				responseId: `${userresponseId}`,
			}
		);
	}
}

document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitTwitter") {
		twitterAuth();
	}
});
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitTwitterNo") {
		window.location.href = "https://ambassador.openloot.com/youtube-auth";
	}
});
// HERE the windows url is checked to see if a code is included
window.onload = function () {
	const twitterExecuted = false;
	if (
		//   window.location.href.indexOf("code") > -1 &&
		//   twitterExecuted === false &&
		//   window.location.href.indexOf("123456") > -1
		// ) {
		//   sendCode();
		//   window.location.href = "https://ambassador.openloot.com/youtube-auth";
		// } else if (
		window.location.href.indexOf("code") > -1 &&
		twitterExecuted === false &&
		window.location.href.indexOf("super") > -1
	) {
		// console.log("twitter auth");
		sendCode();
		window.location.href = "https://ambassador.openloot.com/auth-page";
		twitterExecuted = true;
	} else if (
		window.location.href.indexOf("code") > -1 &&
		twitterExecuted === false &&
		window.location.href.indexOf("base") > -1
	) {
		sendTwitterCode();
		window.location.href = "https://ambassador.openloot.com/youtube-auth";
		twitterExecuted = true;
	} else if (
		window.location.href.indexOf("code") > -1 &&
		twitterExecuted === false &&
		window.location.href.indexOf("twitterDashboard") > -1
	) {
		sendTwitterCodeDashboard();
		window.location.href = "https://ambassador.openloot.com/dashboard";
		twitterExecuted = true;
	}
};
