import commander from "commander";
// import {version} from "../../package.json";
// work-around to avoid TS5505 error bug in TypeScript 3.1 https://github.com/Microsoft/TypeScript/issues/24715
const {version} = require("../../package.json");
import * as commands from "../commands";

commander
	.version(version, "-v, --version");

commander
	.command("new <contest-id>")
	.alias("n")
	.action(commands.setup)
	.description("create new contest project directory");

commander
	.command("submit <filename>")
	.alias("s")
	.option("-c, --contest <contest-id>", "specify contest id to submit")
	.option("-t, --task <task-id>", "specify task id to submit")
	.action(commands.submit)
	.description("submit the program");

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
	.command("task [contest-id] [task-id]")
	.action(commands.task)
	.option("-i, --id", "show task id")
	.description("get task");

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
	.command("check-oj")
	.action(commands.checkOJAvailable)
	.description("check whether online-judge-tools related functions are available or not");

commander
	.command("config-dir")
	.action(commands.configDir)
	.description("get the path of atcoder-cli config directory");

commander.parse(process.argv);
