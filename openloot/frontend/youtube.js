// const axios = require("axios");
const axios = require("axios");
// import supabase from "supabase";
const { createClient } = require("@supabase/supabase-js");

const DATABASE_URL = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const SUPABASE_SERVICE_API_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDc5OTgzMDEsImV4cCI6MTk2MzU3NDMwMX0.h5JPY4tOUZxbBEdAegnYcs35hpdZGt80vCXep5daWAs";
const supabase = createClient(DATABASE_URL, SUPABASE_SERVICE_API_KEY);

async function youtubeAuth() {
	const clientId =
		"109739013430-07r0sf26hduocuaoqjf0rmt9ofutlqg2.apps.googleusercontent.com";
	const redirectUri = "https://ambassador.openloot.com/youtube-auth";
	const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/youtube&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=${redirectUri}&response_type=code&client_id=${clientId}&prompt=consent`;

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl;
}
async function sendCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		await axios.post("https://api-xdws3nxmia-uc.a.run.app/youtube", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
	window.location.href = "https://ambassador.openloot.com/discord-auth";
}

document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitYoutube") {
		youtubeAuth();
	}
});
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitYoutubeNo") {
		window.location.href = "https://ambassador.openloot.com/discord-auth";
	}
});
window.onload = function () {
	if (window.location.href.indexOf("code") > -1) {
		sendCode();
		window.location.href = "https://ambassador.openloot.com/discord-auth";
	}
};
