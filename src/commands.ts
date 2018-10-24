import {AtCoder} from "./atcoder";
import {OnlineJudge} from "./facade/oj";
import {Cookie} from "./cookie";
import * as project from "./project";
import {Contest, Task} from "./definitions";
import getConfig from "./config";
import path from "path";

export async function login() {
	const atcoder = new AtCoder();
	console.log(await atcoder.login() ? "OK" : "login failed");
}

export async function logout() {
	// 空のcookieで設定ファイルを上書きする
	await new Cookie().saveConfigFile();
	console.log("login session aborted.");
}

export async function session() {
	const atcoder = new AtCoder();
	console.log("check login status...");
	console.log(await atcoder.checkSession() ? "OK" : "not login");
}

export async function contest(contest_id: string | undefined, options: { id?: boolean }) {
	const f_id = options.id === true;
	const format = ({id, title, url}: Contest) => formatAsShellOutput([[f_id ? SGR(id, 37) : null, SGR(title, 32, 1), url].filter(e => e !== null) as Array<string>]);
	if (contest_id === undefined) {
		// idが与えられていない場合、プロジェクトファイルを探してコンテスト情報を表示
		try {
			const {data: {contest}} = await project.findProjectJSON();
			console.log(format(contest));
		} catch (e) {
			console.error(e.message);
		}
	}
	else {
		try {
			const atcoder = new AtCoder();
			if (!await atcoder.checkSession()) await atcoder.login();
			const contest = await atcoder.contest(contest_id);
			console.log(format(contest));
		} catch {
			console.error(`contest "${contest_id}" not found.`);
		}
	}
}

export async function task(contest_id: string | undefined, task_id: string | undefined, options: { id?: boolean }) {
	const f_id = options.id === true;
	const format = ({id, label, title, url}: Task) => formatAsShellOutput([[f_id ? SGR(id, 37) : null, SGR(label, 32), SGR(title, 32, 1), url].filter(e => e !== null) as Array<string>]);
	if (contest_id === undefined && task_id === undefined) {
		// idが与えられていない場合、プロジェクトファイルを探す
		try {
			const {task} = await project.detectTaskByPath();
			if (task === null) {
				console.error("failed to find the task.");
				return;
			}
			console.log(format(task));
		} catch (e) {
			console.error(e.message);
		}
	}
	else if (contest_id !== undefined && task_id !== undefined) {
		try {
			const atcoder = new AtCoder();
			if (!await atcoder.checkSession()) await atcoder.login();
			const task = await atcoder.task(contest_id, task_id);
			console.log(format(task));
		} catch {
			console.error(`task "${task_id}" of contest "${contest_id}" not found.`);
		}
	}
	else {
		console.error("error: specify both the contest id and the task id.")
	}
}

export async function tasks(contest_id: string | undefined, options: { id?: boolean }) {
	const f_id = options.id === true;
	const format = (tasks: Array<Task>) => formatAsShellOutput(tasks.map(({id, label, title, url}) => [f_id ? SGR(id, 37) : null, SGR(label, 32), SGR(title, 32, 1), url].filter(e => e !== null) as Array<string>));
	if (contest_id === undefined) {
		// idが与えられていない場合、プロジェクトファイルを探す
		try {
			const {data: {tasks}} = await project.findProjectJSON();
			console.log(format(tasks));
		} catch (e) {
			console.error(e.message);
		}
	}
	else {
		try {
			const atcoder = new AtCoder();
			if (!await atcoder.checkSession()) await atcoder.login();
			const tasks = await atcoder.tasks(contest_id);
			console.log(format(tasks));
		} catch {
			console.error(`contest "${contest_id}" not found.`);
		}
	}
}

export async function url(contest_id: string | undefined, task_id: string | undefined, options: { check?: boolean }) {
	const f_check = options.check === true;
	if (contest_id !== undefined && task_id !== undefined) {
		if (f_check) {
			const atcoder = new AtCoder();
			try {
				const tasks = await atcoder.tasks(contest_id);
				// Task一覧から一致するURLを探す
				for (const {url} of tasks) {
					if (url === AtCoder.getTaskURL(contest_id, task_id)) {
						console.log(url);
						return;
					}
				}
				// なかった
				console.error(`task "${task_id}" not found.`);
			} catch {
				console.error(`contest "${contest_id}" not found.`);
			}
		}
		else {
			// URLの妥当性をチェックしない
			console.log(AtCoder.getTaskURL(contest_id, task_id));
		}
	}
	else if (contest_id !== undefined && task_id === undefined) {
		if (f_check) {
			const atcoder = new AtCoder();
			try {
				// コンテストページの存在確認
				const {url} = await atcoder.contest(contest_id);
				console.log(url);
			} catch {
				console.error(`contest "${contest_id}" not found.`);
			}
		}
		else {
			// URLの妥当性をチェックしない
			console.log(AtCoder.getContestURL(contest_id));
		}
	}
	else {
		console.log(AtCoder.base_url);
	}
}

export async function submit(filename: string, options: { task?: string, contest?: string }) {
	let contest_id = options.contest;
	let task_id = options.task;
	if (contest_id === undefined || task_id === undefined) {
		// コンテストまたはタスクが未指定の場合、カレントディレクトリのパスから提出先を調べる
		const {contest, task} = await project.detectTaskByPath();
		if (contest_id === undefined && contest !== null) contest_id = contest.id;
		if (task_id === undefined && task !== null) task_id = task.id;

		// 結局特定できなかった
		if (contest_id === undefined || task_id === undefined) {
			console.error(`cannot find the ${task_id === undefined ? "task" : "contest"} to submit.`);
			console.error(`add ${task_id === undefined ? "-t" : "-c"} flag to specify it.`);
			return;
		}
	}

	if (!await OnlineJudge.checkAvailable()) {
		console.error("online-judge-tools is not available.");
		return;
	}

	// URLの妥当性をチェック
	const url: string | null = (await new AtCoder().task(contest_id, task_id).catch(() => ({url: null}))).url;
	if (url === null) {
		console.error(`Task ${AtCoder.getTaskURL(contest_id, task_id)} not found.`);
		return;
	}
	console.log(`submit to: ${url}`);
	// 提出
	await OnlineJudge.call(["s", url, filename]);
}

export async function checkOJAvailable() {
	const available = await OnlineJudge.checkAvailable();
	const path = await OnlineJudge.getPath();
	console.log(`online-judge-tools is ${available ? "" : "not "}available. ${available ? "found at:" : ""}`);
	if (available) {
		console.log(path);
	}
}

export async function configDir() {
	const conf = await getConfig();
	console.log(path.resolve(conf.path,".."));
}

export async function setup(contest_id: string) {
	const {contest, tasks} = await project.init(contest_id);
	console.log(`create project of ${contest.title}`);
	for (const task of tasks) {
		await project.installTask(task);
	}
}

/**
 * 文字列の2次元配列を受け取り、行ごとにいい感じのスペースで結合して返す
 * @param data
 */
function formatAsShellOutput(data: Array<Array<string>>): string {
	const padding = "  ";
	const max_lengths = data.map(arr => arr.map(str => str.length)).reduce((a, b) => a.map((v, i) => Math.max(v, b[i])));
	return data.map(line => line.reduceRight((p, c, i) => c.padEnd(max_lengths[i]) + padding + p)).join("\n");
}

/**
 * プロセスがTTYで実行されているならSGRでスタイルを適用する
 * @param str 適用する文字列
 * @param codes コード番号(可変長)
 */
function SGR(str: string, ...codes: Array<number>) {
	if (!process.stdout.isTTY) return str;
	return `${codes.map(code => `\x1b[${code}m`).join("")}${str}\x1b[0m`;
}
