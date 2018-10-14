import commander from "commander";
import {version} from "../../package.json";
import {Session} from "../session";

async function login() {
	const session = new Session();
	console.log(await session.login());
}

async function session() {
	const session = new Session();
	console.log(await session.check());
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
