"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const package_json_1 = require("../../package.json");
const atcoder_1 = require("../atcoder");
const oj_1 = require("../facade/oj");
const project_1 = require("../project");
const config_1 = __importDefault(require("../config"));
async function login() {
    const atcoder = new atcoder_1.AtCoder();
    console.log(await atcoder.login());
}
async function logout() {
    config_1.default().delete("cookies");
    console.log("login session aborted.");
}
async function session() {
    const atcoder = new atcoder_1.AtCoder();
    console.log("check login status...");
    console.log(await atcoder.checkSession());
}
async function contest(id) {
    const atcoder = new atcoder_1.AtCoder();
    if (!await atcoder.checkSession())
        await atcoder.login();
    console.log(await atcoder.contest(id));
}
async function tasks(contest) {
    const atcoder = new atcoder_1.AtCoder();
    if (!await atcoder.checkSession())
        await atcoder.login();
    console.log(await atcoder.tasks(contest));
}
function url(contest, task) {
    if (contest !== undefined && task !== undefined) {
        console.log(atcoder_1.AtCoder.getTaskURL(contest, task));
    }
    else if (contest !== undefined && task === undefined) {
        console.log(atcoder_1.AtCoder.getContestURL(contest));
    }
    else {
        console.log(atcoder_1.AtCoder.base_url);
    }
}
async function oj() {
    console.log(`online-judge-tools is ${(await oj_1.OnlineJudge.checkAvailable()) ? "" : "not "}available.`);
    // await OnlineJudge.call(["l", "http://atcoder.jp/"]);
}
commander_1.default
    .version(package_json_1.version, "-v, --version");
commander_1.default
    .command("new <contest>")
    .action(async (arg) => await project_1.init(arg))
    .description("create new contest project directory");
commander_1.default
    .command("login")
    .action(async () => await login())
    .description("login to AtCoder");
commander_1.default
    .command("logout")
    .action(async () => await logout())
    .description("delete login session information");
commander_1.default
    .command("session")
    .action(async () => await session())
    .description("check login or not");
commander_1.default
    .command("contest <id>")
    .action(async (arg) => await contest(arg))
    .description("get contest title and url from contest id");
commander_1.default
    .command("tasks <contest>")
    .action(async (arg) => await tasks(arg))
    .description("get tasks");
commander_1.default
    .command("url [contest] [task]")
    // UNDONE
    // .option("-c, --check", "check the specified contest and/or task id is valid")
    .action(url)
    .description("get contest or task URL");
commander_1.default
    .command("oj")
    .action(async () => await oj())
    .description("call online-judge");
commander_1.default.parse(process.argv);
