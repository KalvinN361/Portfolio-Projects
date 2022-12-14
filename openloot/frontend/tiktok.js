// const axios = require("axios");
const axios = require("axios");
// import supabase from "supabase";
const { createClient } = require("@supabase/supabase-js");

const DATABASE_URL = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const SUPABASE_SERVICE_API_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDI2NDc4OCwiZXhwIjoxOTg1ODQwNzg4fQ.7GEz9VZimvl44MZnelNMyXjmSEPXDnme6-9YX9d2z8g";
const supabase = createClient(DATABASE_URL, SUPABASE_SERVICE_API_KEY);

async function tiktokAuth() {
	const csrfState = Math.random().toString(36).substring(2);

	const authUrl =
		"https://www.tiktok.com/auth/authorize/" +
		`?client_key=awl3jaifictg61ra` +
		`&scope=user.info.basic,video.list` +
		`&response_type=code` +
		`&redirect_uri=${encodeURIComponent(
			"https://ambassador.openloot.com/tiktok-auth"
		)}` +
		`&state=${csrfState}`;

	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl;
}
async function sendCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		await axios.post("https://server-e4bkq5wbca-uc.a.run.app/tiktok", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
}
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitTikTok") {
		tiktokAuth();
	}
});
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitTikTokNo") {
		window.location.href =
			"https://ambassador.openloot.com/_hcms/mem/login?redirect_url=https://ambassador.openloot.com/dashboard";
	}
});

// HERE the windows url is checked to see if a code is included
window.onload = function () {
	if (window.location.href.indexOf("code") > -1) {
		sendCode();
		window.location.href =
			"https://ambassador.openloot.com/_hcms/mem/login?redirect_url=https://ambassador.openloot.com/dashboard";
	}
};
