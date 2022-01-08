import commander from "commander";
import {name, version} from "../../package.json";
import * as commands from "../commands";
import * as help from "../help";
import updateNotifier from "update-notifier";

updateNotifier({pkg: {name, version}}).notify({isGlobal: true});

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
	.option("--no-tests", "skip downloading sample cases by using online-judge-tools")
	.option("--template <name>", "specify the provisioning template")
	.option("--no-template", "do not use templates, even if specified by global config")
	.description("create new contest project directory")
	.on("--help", () => {
		console.log("");
		console.log(help.task_choices);
	});

commander
	.command("add")
	.alias("a")
	.action(commands.add)
	.option('-c, --choice <choice>', "how to choice tasks to add", /^(inquire|all|none|rest|next)$/i)
	.option("-f, --force", "ignore existent directories")
	.option("-t, --task-dirname-format <format>", "specify the format to name task directories. defaults to \"{tasklabel}\"")
	.option("--no-tests", "skip downloading sample cases by using online-judge-tools")
	.option("--template <name>", "specify the provisioning template")
	.option("--no-template", "do not use templates, even if specified by global config")
	.description("add new directory for the task in the project directory")
	.on("--help", () => {
		console.log("");
		console.log(help.task_choices);
	});

commander
	.command("submit [filename] [facade-options...]")
	.alias("s")
	.option("-c, --contest <contest-id>", "specify contest id to submit")
	.option("-t, --task <task-id>", "specify task id to submit")
	.option("-s, --skip-filename", "specify that filename is not given (the first argument will be parsed as not a filename, but a facade option)")
	.action(commands.submit)
	.description("submit the program")
	.on("--help", () => {
		console.log("");
		console.log(help.submit_facade_options);
	});

commander
	.command("login")
	.option("-u, --username <username>", "your username")
	.option("-p, --password <password>", "your password")
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
	.option("-t, --title", "show contest title")
	.option("-i, --id", "show contest id")
	.option("-u, --url", "show contest url")
	.description("get contest information");

commander
	.command("task [contest-id] [task-id]")
	.action(commands.task)
	.option("-l, --label", "show task label")
	.option("-t, --title", "show task title")
	.option("-i, --id", "show task id")
	.option("-u, --url", "show task url")
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
	.description("format string with contest and/or task information.")
	.on("--help", () => {
		console.log("");
		console.log(help.format_strings);
	});

commander
	.command("check-oj")
	.action(commands.checkOJAvailable)
	.description("check whether online-judge-tools related functions are available or not")
	.on("--help", () => {
		console.log("");
		console.log(help.online_judge_tools);
	});

commander
	.command("config [key] [value]")
	.option("-d", "delete the option value and set back to the default")
	.action(commands.config)
	.description("get or set values of global options")
	.on("--help", () => {
		console.log("");
		console.log(help.global_config);
	});

commander
	.command("config-dir")
	.action(commands.configDir)
	.description("get the path of atcoder-cli config directory");

commander
	.command("templates")
	.action(commands.getTemplateList)
	.description("show user templates in the config directory")
	.on("--help", () => {
		console.log("");
		console.log(help.provisioning_templates);
	});


commander.on("--help", () => {
	console.log("");
	console.log(help.default_help);
});

// error on unknown commands
commander.on("command:*", function () {
	console.error('Invalid command: %s\nUse `acc --help` for a list of available commands.', commander.args.join(' '));
});

commander.parse(process.argv);
