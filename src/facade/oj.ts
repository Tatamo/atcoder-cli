import getConfig from "../config";
import child_process from "child_process";
import {promisify} from "util";

const exec = promisify(child_process.exec);

export class OnlineJudge {
	static async getPath(): Promise<string | null> {
		const config = getConfig();
		let path = config.get("oj-path");
		// configにpathが設定されていない場合はwhichコマンドで探してみる
		if (path === undefined || path.trim() === "") {
			const command = process.platform === "win32" ? "where oj" : "which oj";
			path = (await exec(command).then(v => v.stdout.trim()).catch(() => ""));
		}
		return path === "" ? null : path;
	}

	static async checkAvailable() {
		const path = OnlineJudge.getPath();
		if (path === null) return false;
		const result = (await exec(`${path} -h`).then(v => v.stdout).catch(() => "")).trim() !== "";
		// うまくpathが通っていた場合はconfigに登録する
		if (result && getConfig().get("oj-path") === undefined) getConfig().set("oj-path", path);
		return result;
	}
}