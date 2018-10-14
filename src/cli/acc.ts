import commander from "commander";
import {version} from "../../package.json";
import {AtCoder} from "../atcoder";

async function login() {
	const atcoder = new AtCoder();
	console.log(await atcoder.login());
}

async function session() {
	const atcoder = new AtCoder();
	console.log(await atcoder.checkSession());
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

commander
	.version(version, "-v, --version");

commander
	.command("login")
	.action(async () => await login())
	.description("login to AtCoder");

commander
	.command("session")
	.action(async () => await session())
	.description("check login or not");

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

commander.parse(process.argv);
