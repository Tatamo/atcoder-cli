import {AtCoder} from "./atcoder";
import {OnlineJudge} from "./facade/oj";
import {Cookie} from "./cookie";
import * as project from "./project";
import {PROJECT_JSON_FILE_NAME} from "./project";

export async function login() {
	const atcoder = new AtCoder();
	console.log(await atcoder.login());
}

export async function logout() {
	// 空のcookieで設定ファイルを上書きする
	await new Cookie().saveConfigFile();
	console.log("login session aborted.");
}

export async function session() {
	const atcoder = new AtCoder();
	console.log("check login status...");
	console.log(await atcoder.checkSession());
}

export async function contest(id?: string) {
	if (id === undefined) {
		// idが与えられていない場合、プロジェクトファイルを探してコンテスト情報を表示
		try {
			const {data: {contest}} = await project.findProjectJSON();
			console.log(contest);
		} catch {
			console.log(`${PROJECT_JSON_FILE_NAME} not found. specify contest id.`)
		}
	}
	else {
		const atcoder = new AtCoder();
		if (!await atcoder.checkSession()) await atcoder.login();
		console.log(await atcoder.contest(id));
	}
}

export async function tasks(contest_id?: string) {
	if (contest_id === undefined) {
		// idが与えられていない場合、プロジェクトファイルを探す
		try {
			const {data: {tasks}} = await project.findProjectJSON();
			console.log(tasks);
		} catch {
			console.log(`${PROJECT_JSON_FILE_NAME} not found. specify contest and/or task id.`)
		}
	}
	else {
		const atcoder = new AtCoder();
		if (!await atcoder.checkSession()) await atcoder.login();
		console.log(await atcoder.tasks(contest_id));
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
