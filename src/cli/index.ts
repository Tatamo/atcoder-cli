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
	.option('-c, --choice <choice>', "how to choice tasks to add", /^(inquire|all|none|rest|next)$/i)
	.option("-f, --force", "ignore existent directories")
	.option("-d, --contest-dirname-format <format>", "specify the format to name contest directory. defaults to \"{ContestID}\"")
	.option("-t, --task-dirname-format <format>", "specify the format to name task directories. defaults to \"{tasklabel}\"")
	.option("--template <name>", "specify the provisioning template")
	.option("--no-tests", "skip downloading sample cases by using online-judge-tools")
	.description("create new contest project directory")
	.on("--help", function () {
		console.log("");
		console.log("Supported arguments for --choice:");
		console.log("  inquire  inquire the tasks to add");
		console.log("  all      select all tasks");
		console.log("  none     select no tasks");
		console.log("  rest     select all tasks not added yet");
		console.log("           (without --force option, same with \"all\")");
		console.log("  next     select the top task that is not added yet");
	});

commander
	.command("add")
	.alias("a")
	.action(commands.add)
	.option('-c, --choice <choice>', "how to choice tasks to add", /^(inquire|all|none|rest|next)$/i)
	.option("-f, --force", "ignore existent directories")
	.option("-t, --task-dirname-format <format>", "specify the format to name task directories. defaults to \"{tasklabel}\"")
	.option("--template <name>", "specify the provisioning template")
	.option("--no-tests", "skip downloading sample cases by using online-judge-tools")
	.description("add new directory for the task in the project directory")
	.on("--help", function () {
		console.log("");
		console.log("Supported arguments for --choice:");
		console.log("  inquire  inquire the tasks to add");
		console.log("  all      select all tasks");
		console.log("  none     select no tasks");
		console.log("  rest     select all tasks not added yet");
		console.log("           (without --force option, same with \"all\")");
		console.log("  next     select the top task that is not added yet");
	});

commander
	.command("submit [filename]")
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
	.command("format <format> <contest-id> [task-id]")
	.action(commands.format)
	.description("format string with contest and/or task information.");

commander
	.command("check-oj")
	.action(commands.checkOJAvailable)
	.description("check whether online-judge-tools related functions are available or not");

commander
	.command("config [key] [value]")
	.option("-d", "delete the option value and set back to the default")
	.action(commands.config)
	.description("get or set values of global options");

commander
	.command("config-dir")
	.action(commands.configDir)
	.description("get the path of atcoder-cli config directory");

commander
	.command("templates")
	.action(commands.getTemplateList)
	.description("show user templates in the config directory");

commander.parse(process.argv);
