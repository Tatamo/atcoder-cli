import commander from "commander";
// import {version} from "../../package.json";
// work-around to avoid TS5505 error bug in TypeScript 3.1 https://github.com/Microsoft/TypeScript/issues/24715
const {version} = require("../../package.json");
import {AtCoder} from "../atcoder";
import {OnlineJudge} from "../facade/oj";
import {init} from "../project";
import getConfig from "../config";

async function login() {
	const atcoder = new AtCoder();
	console.log(await atcoder.login());
}

async function logout() {
	getConfig().delete("cookies");
	console.log("login session aborted.")
}

async function session() {
	const atcoder = new AtCoder();
	console.log("check login status...");
	console.log(await atcoder.checkSession());
}

async function contest(id: string) {
	const atcoder = new AtCoder();
	if (!await atcoder.checkSession()) await atcoder.login();
	console.log(await atcoder.contest(id));
}

async function tasks(contest: string) {
	const atcoder = new AtCoder();
	if (!await atcoder.checkSession()) await atcoder.login();
	console.log(await atcoder.tasks(contest));
}

function url(contest?: string, task?: string) {
	if (contest !== undefined && task !== undefined) {
		console.log(AtCoder.getTaskURL(contest, task));
	}
	else if (contest !== undefined && task === undefined) {
		console.log(AtCoder.getContestURL(contest));
	}
	else {
		console.log(AtCoder.base_url);
	}
}

async function oj() {
	console.log(`online-judge-tools is ${(await OnlineJudge.checkAvailable()) ? "" : "not "}available.`);
	// await OnlineJudge.call(["l", "http://atcoder.jp/"]);
}

commander
	.version(version, "-v, --version");

commander
	.command("new <contest>")
	.action(async (arg: string) => await init(arg))
	.description("create new contest project directory");

commander
	.command("login")
	.action(async () => await login())
	.description("login to AtCoder");

commander
	.command("logout")
	.action(async () => await logout())
	.description("delete login session information");

commander
	.command("session")
	.action(async () => await session())
	.description("check login or not");

commander
	.command("contest <id>")
	.action(async (arg: string) => await contest(arg))
	.description("get contest title and url from contest id");

commander
	.command("tasks <contest>")
	.action(async (arg: string) => await tasks(arg))
	.description("get tasks");

commander
	.command("url [contest] [task]")
	// UNDONE
	// .option("-c, --check", "check the specified contest and/or task id is valid")
	.action(url)
	.description("get contest or task URL");

commander
	.command("oj")
	.action(async () => await oj())
	.description("call online-judge");

commander.parse(process.argv);
