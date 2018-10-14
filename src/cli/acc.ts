import commander from "commander";
import {version} from "../../package.json";
import {Session} from "../session";

async function login() {
	const session = new Session();
	console.log(await session.login());
}

commander
	.version(version, "-v, --version");

commander
	.command("login")
	.action(async () => await login())
	.description("login to AtCoder");

commander.parse(process.argv);
