// const axios = require("axios");
const axios = require("axios");
// import supabase from "supabase";
const { createClient } = require("@supabase/supabase-js");

const DATABASE_URL = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const SUPABASE_SERVICE_API_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDc5OTgzMDEsImV4cCI6MTk2MzU3NDMwMX0.h5JPY4tOUZxbBEdAegnYcs35hpdZGt80vCXep5daWAs";
const supabase = createClient(DATABASE_URL, SUPABASE_SERVICE_API_KEY);

async function discordAuth() {
	const csrfState = Math.random().toString(36).substring(2);
	const clientId = "1009523640901058632";
	const redirectUri = "https://ambassador.openloot.com/discord-auth";
	const scopes = "activities.read,email,identify,guilds";
	const authUrl = `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${clientId}&state=${csrfState}&scope=email%20identify%20guilds&redirect_uri=${redirectUri}&prompt=consent`;

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl;
}
async function sendCode() {
	// Get the user responseId from localstorage
	let userresponseId = localStorage.getItem("responseId");
	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		// HERE we make a post request to our backend running on cloud run with the code we got from twitch
		await axios.post("https://api-xdws3nxmia-uc.a.run.app/discord", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
}
// Event listener for the discord button
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitDiscord") {
		discordAuth();
	}
});
// Event listener for the discord button No
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitDiscordNo") {
		window.location.href = "https://ambassador.openloot.com/tiktok-auth";
	}
});
// Checks the url for "code" and if it exists it will run the sendCode function and then redirect to the next page
window.onload = function () {
	if (window.location.href.indexOf("code") > -1) {
		sendCode();
		window.location.href = "https://ambassador.openloot.com/tiktok-auth";
	}
};
