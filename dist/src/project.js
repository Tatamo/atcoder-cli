"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atcoder_1 = require("./atcoder");
const fs_1 = require("fs");
const mkdirp_1 = __importDefault(require("mkdirp"));
const util_1 = require("util");
const oj_1 = require("./facade/oj");
/**
 * コンテスト情報を取得し、プロジェクトディレクトリを作成する
 * @param contest_id
 */
exports.init = async (contest_id) => {
    const atcoder = new atcoder_1.AtCoder();
    if (!await atcoder.checkSession())
        await atcoder.login();
    const [contest, tasks] = await Promise.all([atcoder.contest(contest_id), atcoder.tasks(contest_id)]).catch(() => [null, null]);
    if (contest === null && tasks === null) {
        throw new Error("failed to get contest information.");
    }
    try {
        await util_1.promisify(fs_1.mkdir)(contest_id);
    }
    catch (_a) {
        // throw new Error(`${contest_id} file/directory already exists.`)
        console.error(`${contest_id} file/directory already exists.`);
        return false;
    }
    process.chdir(contest_id);
    const data = { contest, tasks };
    await util_1.promisify(fs_1.writeFile)("contest.json", JSON.stringify(data, undefined, 2));
    console.log(`${contest_id}/contest.json created.`);
    return true;
};
exports.installTask = async (task, project_path) => {
    if (project_path !== undefined)
        process.chdir(project_path);
    await util_1.promisify(mkdirp_1.default)(task.id);
    process.chdir(task.id);
    if (oj_1.OnlineJudge.checkAvailable()) {
        oj_1.OnlineJudge.call(["dl", task.url]);
    }
    else {
        console.error("online-judge-tools is not available. downloading of sample cases skipped.");
    }
};
