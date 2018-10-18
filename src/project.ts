import {AtCoder, Task} from "./atcoder";
import {mkdir, writeFile} from "fs";
import mkdirp from "mkdirp";
import {promisify} from "util";
import {OnlineJudge} from "./facade/oj";

/**
 * コンテスト情報を取得し、プロジェクトディレクトリを作成する
 * @param contest_id
 */
export const init: (contest_id: string) => Promise<boolean> = async (contest_id: string) => {
	const atcoder = new AtCoder();
	if (!await atcoder.checkSession()) await atcoder.login();
	const [contest, tasks] = await Promise.all([atcoder.contest(contest_id), atcoder.tasks(contest_id)]).catch(() => [null, null]);
	if (contest === null && tasks === null) {
		throw new Error("failed to get contest information.");
	}
	try {
		await promisify(mkdir)(contest_id);
	}
	catch {
		// throw new Error(`${contest_id} file/directory already exists.`)
		console.error(`${contest_id} file/directory already exists.`);
		return false;
	}
	process.chdir(contest_id);
	const data = {contest, tasks};
	await promisify(writeFile)("contest.json", JSON.stringify(data, undefined, 2));
	console.log(`${contest_id}/contest.json created.`);
	return true;
};

export const installTask = async (task: Task, project_path?: string) => {
	if (project_path !== undefined) process.chdir(project_path);
	await promisify(mkdirp)(task.id);
	process.chdir(task.id);
	if (OnlineJudge.checkAvailable()) {
		OnlineJudge.call(["dl", task.url]);
	} else {
		console.error("online-judge-tools is not available. downloading of sample cases skipped.");
	}
};
