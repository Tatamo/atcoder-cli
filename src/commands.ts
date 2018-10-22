import {AtCoder} from "./atcoder";
import {OnlineJudge} from "./facade/oj";
import {Cookie} from "./cookie";
import * as project from "./project";
import {Contest, Task} from "./definitions";

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

export async function tasks(contest_id: string | undefined, options: { id?: boolean }) {
	const f_id = options.id === true;
	const format = (tasks: Array<Task>) => formatAsShellOutput(tasks.map(({id, label, title}) => [f_id ? SGR(id, 37) : null, SGR(label, 32), SGR(title, 32, 1)].filter(e => e !== null) as Array<string>));
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

export function url(contest?: string, task?: string) {
	if (contest !== undefined && task !== undefined) {
		console.log(AtCoder.getTaskURL(contest, task));
	}
	else if (contest !== undefined && task === undefined) {
		console.log(AtCoder.getContestURL(contest));
	}
	else {
		console.log(AtCoder.base_url);
	}
}

export async function oj() {
	const available = await OnlineJudge.checkAvailable();
	const path = await OnlineJudge.getPath();
	console.log(`online-judge-tools is ${available ? "" : "not "}available. ${available ? "found at:" : ""}`);
	if (available) {
		console.log(path);
	}
	// await OnlineJudge.call(["l", "http://atcoder.jp/"]);
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
