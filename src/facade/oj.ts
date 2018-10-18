import getConfig from "../config";
import child_process from "child_process";
import {promisify} from "util";

const exec = promisify(child_process.exec);

export class OnlineJudge {
	static async checkAvailable() {
		const config = getConfig();
		let path = config.get("oj-path");
		// configにpathが設定されていない場合はwhichコマンドで探してみる
		if (path === undefined || path.trim() === "") {
			const command = process.platform === "win32" ? "where oj" : "which oj";
			path = (await exec(command).then(v => v.stdout.trim()).catch(() => ""));
		}

		if (path === "") return false;
		const result = await exec(`${path} -h`).then(v => v.stdout).catch(() => "");
		return result.trim() !== "";
	}
}