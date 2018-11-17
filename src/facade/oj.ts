import getConfig from "../config";
import child_process from "child_process";
import {promisify} from "util";

const exec = promisify(child_process.exec);

export class OnlineJudge {
	/**
	 * online-judge-toolsの実行ファイルの絶対パスを返します 見つからなかった場合はnull
	 */
	static async getPath(): Promise<string | null> {
		const config = await getConfig();
		let path = config.get("oj-path");
		// configにpathが設定されていない場合はwhichコマンドで探してみる
		if (path === undefined || path === null || path.trim() === "") {
			const command = process.platform === "win32" ? "where oj" : "which oj";
			path = (await exec(command).then(v => v.stdout.trim()).catch(() => ""));
		}
		return path === "" ? null : path;
	}

	/**
	 * online-judge-toolsがインストールされているかどうか調べます
	 */
	static async checkAvailable(): Promise<boolean> {
		const path = await OnlineJudge.getPath();
		if (path === null) return false;
		const result = (await exec(`${path} -h`).then(v => v.stdout).catch(() => "")).trim() !== "";
		// うまくpathが通っていた場合はconfigに登録する
		const config = await getConfig();
		if (result && config.get("oj-path") !== path) config.set("oj-path", path);
		return result;
	}

	/**
	 * ojコマンドを呼び出し、その標準入出力を共有します
	 * @param args 引数の配列
	 */
	static async call(args: Array<string>): Promise<void> {
		const path = await OnlineJudge.getPath();
		if (path === null) throw new Error("online-judge-tools not installed.");
		await new Promise((resolve) => {
			const oj = child_process.spawn(path, args, {stdio: "inherit"});
			oj.on("close", () => resolve());
		});
	}
}
