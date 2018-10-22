import commander from "commander";
// import {version} from "../../package.json";
// work-around to avoid TS5505 error bug in TypeScript 3.1 https://github.com/Microsoft/TypeScript/issues/24715
const {version} = require("../../package.json");
import * as commands from "../commands";

commander
	.version(version, "-v, --version");

commander
	.command("new <contest-id>")
	.alias("setup")
	.action(commands.setup)
	.description("create new contest project directory");

commander
	.command("login")
	.action(commands.login)
	.description("login to AtCoder");

commander
	.command("logout")
	.action(commands.logout)
	.description("delete login session information");

commander
	.command("session")
	.action(commands.session)
	.description("check login or not");

commander
	.command("contest [contest-id]")
	.action(commands.contest)
	.option("-i, --id", "show contest id")
	.description("get contest information");

commander
	.command("tasks [contest-id]")
	.action(commands.tasks)
	.option("-i, --id", "show task id")
	.description("get tasks");

commander
	.command("url [contest] [task]")
	.option("-c, --check", "check the specified contest and/or task id is valid")
	.action(commands.url)
	.description("get contest or task URL");

commander
	.command("oj")
	.action(commands.oj)
	.description("call online-judge");

commander.parse(process.argv);
