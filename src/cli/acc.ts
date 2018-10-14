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

async function tasks() {
	// do nothing
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
	.command("tasks")
	.action(async () => await tasks())
	.description("get tasks");

commander.parse(process.argv);
