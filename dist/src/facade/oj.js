"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const child_process_1 = __importDefault(require("child_process"));
const util_1 = require("util");
const exec = util_1.promisify(child_process_1.default.exec);
class OnlineJudge {
    /**
     * online-judge-toolsの実行ファイルの絶対パスを返します 見つからなかった場合はnull
     */
    static async getPath() {
        const config = config_1.default();
        let path = config.get("oj-path");
        // configにpathが設定されていない場合はwhichコマンドで探してみる
        if (path === undefined || path.trim() === "") {
            const command = process.platform === "win32" ? "where oj" : "which oj";
            path = (await exec(command).then(v => v.stdout.trim()).catch(() => ""));
        }
        return path === "" ? null : path;
    }
    /**
     * online-judge-toolsがインストールされているかどうか調べます
     */
    static async checkAvailable() {
        const path = OnlineJudge.getPath();
        if (path === null)
            return false;
        const result = (await exec(`${path} -h`).then(v => v.stdout).catch(() => "")).trim() !== "";
        // うまくpathが通っていた場合はconfigに登録する
        if (result && config_1.default().get("oj-path") === undefined)
            config_1.default().set("oj-path", path);
        return result;
    }
    /**
     * ojコマンドを呼び出し、その標準入出力を共有します
     * @param args 引数の配列
     */
    static async call(args) {
        const path = await OnlineJudge.getPath();
        if (path === null)
            throw new Error("online-judge-tools not installed.");
        await new Promise((resolve) => {
            const oj = child_process_1.default.spawn(path, args, { stdio: "inherit" });
            oj.on("close", () => resolve());
        });
    }
}
exports.OnlineJudge = OnlineJudge;
