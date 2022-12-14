const axios = require("axios");
// const axios = require("axios");
// import supabase from "supabase";
const { createClient } = require("@supabase/supabase-js");

const DATABASE_URL = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const SUPABASE_SERVICE_API_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDI2NDc4OCwiZXhwIjoxOTg1ODQwNzg4fQ.7GEz9VZimvl44MZnelNMyXjmSEPXDnme6-9YX9d2z8g";
const supabase = createClient(DATABASE_URL, SUPABASE_SERVICE_API_KEY);
// const { BigQuery } = require("@google-cloud/bigquery");
// const bigqueryClient = new BigQuery();
// const TableObjectHeader = {
//   tableReference: {
//     projectId: " mindr-359117",
//     datasetId: "mindr-359117.openloot",
//     tableId: "mindr-359117.openloot.open_loot",
//   },
// };
// const dataset = bigqueryClient.setdataset(
//   TableObjectHeader["tableReference"]["datasetId"]
// );
// const table = dataset.table(TableObjectHeader["tableReference"]["tableId"]);

async function twitchAuth() {
	// HERE an access token is received so that we can create a conditional to check for user access token so that the function does not run repeatedly.
	const authUrl =
		"https://id.twitch.tv/oauth2/authorize" +
		`?response_type=code` +
		`&client_id=${encodeURIComponent("yk62ix6gpuplw5acj37vh5l06zjobw")}` +
		`&redirect_uri=${encodeURIComponent(
			"https://ambassador.openloot.com/twitch-auth"
		)}` +
		`&scope=channel:read:subscriptions+user:read:broadcast+user:read:email` +
		`&state=c3ab8aa609ea11e793ae92361f002671`;
	let userresponseId = localStorage.getItem("responseId");
	const { data: sbData, error1 } = await supabase
		.from("openloot")
		.select("*")
		.eq("responseId", userresponseId)
		.single();
	if (sbData == null) {
		const { data, error } = await supabase
			.from("openloot")
			.insert([{ responseId: userresponseId }]);
	}
	// HERE we will be redirecting the user to twitch authorization page for oAuth
	window.location.href = authUrl + "&output=embed";
}
async function sendCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		await axios.post("https://server-e4bkq5wbca-uc.a.run.app/twitch", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
}

async function sendTwitchCode() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		await axios.post("https://server-e4bkq5wbca-uc.a.run.app/twitchProfile", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
	window.location.href = "https://ambassador.openloot.com/auth-page";
}

async function sendTwitchCodeDashboard() {
	let userresponseId = localStorage.getItem("responseId");

	if (typeof window !== "undefined") {
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		await axios.post("https://server-e4bkq5wbca-uc.a.run.app/twitchDashboard", {
			code: `${code}`,
			responseId: `${userresponseId}`,
		});
	}
	window.location.href = "https://ambassador.openloot.com/dashboard";
}
async function userresponseId() {
	let userresponseId = localStorage.getItem("responseId");
	const { data: sbData, error1 } = await supabase
		.from("openloot")
		.select("*")
		.eq("responseId", userresponseId)
		.single();
	// console.log(sbData);
	if (sbData == null) {
		const { data, error } = await supabase
			.from("openloot")
			.insert([{ responseId: userresponseId }]);
		// console.log(error);
	}
	window.location.href = "https://ambassador.openloot.com/twitter-auth/";
}
// HERE we will query the acccess token and use it to validate access token

document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submit") {
		twitchAuth();
		sendCode();
	}
});
document.addEventListener("click", function (evnt) {
	if (evnt.target.id === "submitNo") {
		userresponseId();
	}
});

// document.addEventListener("click", function (evnt) {
//   if (evnt.target.id === "submitTwitter") {
//     twitterAuth();
//   }
// });
// HERE the windows url is checked to see if a code is included
// window.onload = function () {
//   if (window.location.href.indexOf("code") > -1) {
//     sendCode();
//     window.location.href = "https://ambassador.openloot.com/twitter-auth";
//   }
// };
window.onload = function () {
	const twitchExecuted = false;
	if (
		window.location.href.indexOf("code") > -1 &&
		twitchExecuted === false &&
		window.location.href.indexOf("c3ab8aa609ea11e793ae92361f002671") > -1
	) {
		sendCode();
		window.location.href = "https://ambassador.openloot.com/twitter-auth";
	} else if (
		window.location.href.indexOf("code") > -1 &&
		twitchExecuted === false &&
		window.location.href.indexOf("1998") > -1
	) {
		sendTwitchCode();
		twitchExecuted = true;
	} else if (
		window.location.href.indexOf("code") > -1 &&
		twitchExecuted === false &&
		window.location.href.indexOf("twitchDashboard") > -1
	) {
		sendTwitchCodeDashboard();
	}
};
