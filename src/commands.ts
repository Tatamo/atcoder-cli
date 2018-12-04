import {AtCoder} from "./atcoder";
import {OnlineJudge} from "./facade/oj";
import {Cookie} from "./cookie";
import {Contest, Task, detectTaskByPath, findProjectJSON, formatTaskDirname, saveProjectJSON, init, installTask, formatContestDirname} from "./project";
import getConfig, {defaults, getConfigDirectory} from "./config";
import {getTemplate, getTemplates, Template} from "./template";

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
			const {data: {contest}} = await findProjectJSON();
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
			const {task} = await detectTaskByPath();
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
			const {data: {tasks}} = await findProjectJSON();
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

export async function format(format_string: string, contest_id: string, task_id?: string) {
	const atcoder = new AtCoder();
	if (!await atcoder.checkSession()) await atcoder.login();
	if (task_id === undefined) {
		// コンテスト情報のみを使用
		try {
			const contest = await atcoder.contest(contest_id);
			console.log(formatContestDirname(format_string, contest));
		} catch (e) {
			console.error(e.toString());
		}
	}
	else {
		// コンテスト・問題情報を使用
		try {
			const [contest, tasks] = await Promise.all([atcoder.contest(contest_id), atcoder.tasks(contest_id)]);
			// 問題番号を調べる
			let index = -1;
			for (let i = 0; i < tasks.length; i++) {
				if (tasks[i].id === task_id) {
					index = i;
					break;
				}
			}
			if (index < 0) {
				console.error(`task ${task_id} not found.`);
				return;
			}
			try {
				console.log(formatTaskDirname(format_string, tasks[index], index, contest));
			} catch (e) {
				console.error(e.toString());
			}
		} catch {
			// TODO: もう少し良いエラーハンドリングができないものか
			console.error("failed to get contest information.");
		}
	}
}

export async function submit(filename: string | undefined, options: { task?: string, contest?: string }) {
	let contest_id = options.contest;
	let task_id = options.task;
	if (filename === undefined || contest_id === undefined || task_id === undefined) {
		// ファイル名、タスク、コンテストのいずれかが未指定の場合、カレントディレクトリのパスから提出先を調べる
		const {contest, task} = await detectTaskByPath();
		if (filename === undefined && task !== null && task.directory !== undefined) filename = task.directory.submit;
		if (contest_id === undefined && contest !== null) contest_id = contest.id;
		if (task_id === undefined && task !== null) task_id = task.id;

		// 結局特定できなかった
		if (filename === undefined) {
			console.error(`the program file to submit is not found.`);
			return;
		}
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
	console.log(await getConfigDirectory());
}

export async function config(key: string | undefined, value: string | undefined, options: { D?: boolean }) {
	if (options.D) {
		await deleteGlobalConfig(key);
	}
	else if (key !== undefined && value !== undefined) {
		await setGlobalConfig(key, value);
	}
	else {
		await getGlobalConfig(key);
	}
}

async function getGlobalConfig(key?: string) {
	const conf = await getConfig();
	if (key === undefined) {
		for (const key of Object.keys(defaults)) {
			console.log(undef2empty`${key}: ${conf.get(key)}`)
		}
		return;
	}
	if (!(key in defaults)) {
		console.error(`invalid option "${key}".`);
		return;
	}
	console.log(undef2empty`${conf.get(key)}`);
}

async function setGlobalConfig(key: string, value: string) {
	const conf = await getConfig();
	if (!(key in defaults)) {
		console.error(`invalid option "${key}".`);
		return;
	}
	conf.set(key, value);
	console.log(undef2empty`${key} = ${conf.get(key)}`);
}

async function deleteGlobalConfig(key?: string) {
	const conf = await getConfig();
	if (key !== undefined) {
		if (!(key in defaults)) {
			console.error(`invalid option "${key}".`);
			return;
		}
		conf.delete(key);
		console.log(`option "${key}" is set back to default.`);
	}
	else {
		console.error("option key is not specified.");
	}
}

/**
 * テンプレート文字列に挿入された式がundefinedであった場合に"undefined"のかわりに空文字列に変換する
 * @param strings
 * @param values
 */
function undef2empty(strings: TemplateStringsArray, ...values: Array<any>): string {
	values = values.map(value => value !== undefined ? value : "");
	return String.raw(strings, ...values);
}

type Choices = "inquire" | "all" | "none" | "rest" | "next"

/**
 * --choiceオプションに渡される値として適切かどうかを判定する
 * @param choice
 */
function checkValidChoiceOption(choice: any): choice is Choices {
	switch (choice) {
		case "inquire":
		case "all":
		case "none":
		case "rest":
		case "next":
			return true;
	}
	return false;
}

async function getTemplateFromOption(template?: string | boolean): Promise<Template | undefined> {
	// --no-templateオプションが指定された場合は何も選ばない
	if (template === false) return undefined;
	// 未指定の場合はコンフィグよりデフォルト値を取得
	if (template === undefined || template === true) template = (await getConfig()).get("default-template") as string | undefined;
	// デフォルト値も指定されていなければ何も選ばない
	if (template === undefined) return undefined;
	return await getTemplate(template).catch((e) => {
		throw new Error(`Failed to load template "${template}".\n  ${e}`);
	});
}

export async function setup(contest_id: string, options: { choice: Choices, force?: boolean, contestDirnameFormat?: string, taskDirnameFormat?: string, template?: string | boolean, tests?: boolean }) {
	try {
		const template = await getTemplateFromOption(options.template);
		const {contest} = await init(contest_id, template, options);
		console.log(`create project of ${contest.title}`);
		await add(options);
	} catch (e) {
		console.error(e.message);
	}
}

export async function add(options: { choice?: Choices | boolean, force?: boolean, taskDirnameFormat?: string, template?: string | boolean, tests?: boolean }) {
	try {
		const {path, data} = await findProjectJSON();
		const {contest, tasks} = data;
		const choices = await (async (c) => {
			// choiceオプションが設定されていない場合はコンフィグからデフォルト値を取得
			let flg_default_choice = false;
			if (c === undefined) {
				c = (await getConfig()).get("default-task-choice");
				flg_default_choice = true;
			}
			// 有効な値が与えられているかどうかバリデーションを行う
			if (!checkValidChoiceOption(c)) {
				throw new Error(`Invalid option is given with --choice. (inquire/all/none/rest/next)${flg_default_choice ? "\nIf you did not set the --choice option, check the \"default-task-choice\" option in global config by using `acc config`." : ""}`);
			}
			return await selectTasks(tasks, c, options.force);
		})(options.choice);
		const template = await getTemplateFromOption(options.template);
		// 更新があった問題の数を数えておく
		let count = 0;
		for (const {index, task} of choices) {
			// forceオプションが設定されていない場合、既にディレクトリが存在する問題はスキップする
			if (options.force !== true && task.directory !== undefined) continue;
			const format = options.taskDirnameFormat !== undefined ? options.taskDirnameFormat : (await getConfig()).get("default-task-dirname-format");
			const dirname = formatTaskDirname(format, task, index, contest);
			// 新しいTaskが返ってくるので、もともとの配列の要素を更新する
			tasks[index] = await installTask({task, index, contest, template}, dirname, path, {tests: options.tests});
			count++;
		}
		if (count === 0) {
			// 問題が何も更新されなかった場合、その旨を通知する
			console.error(SGR("Skip: no task directories were created. use --force option to overwrite existent directries.", 33));
		}
		// 更新されたContestProjectをファイルに書き出し
		await saveProjectJSON(Object.assign(data, {tasks}));
	} catch (e) {
		console.error(SGR(e.message, 33));
	}
}

export async function selectTasks(tasks: Array<Task>, choice: Choices, force: boolean = false): Promise<Array<{ index: number, task: Task }>> {
	switch (choice) {
		case "inquire":
			return await inquireTasks(tasks, force);
		case "all":
			return tasks.map((task, index) => ({index, task}));
		case "none":
			return [];
		case "rest":
			return tasks.filter(task => task.directory === undefined).map((task, index) => ({index, task}));
		case "next":
			const next = getNextTask2Install(tasks);
			return next !== null ? [next] : [];
		default:
			throw new Error(`mode "${choice}" is not defined"`);
	}
}

export async function inquireTasks(tasks: Array<Task>, force: boolean = false): Promise<Array<{ index: number, task: Task }>> {
	const inquirer = await import("inquirer");
	// まだディレクトリが作成されていない問題を一つだけ選択状態にしておく
	const next = getNextTask2Install(tasks);
	if (!force && next === null) throw new Error("all tasks are already installed. use --force option to overwrite them.");
	return (await inquirer.prompt([{
		type: "checkbox",
		message: "select tasks",
		name: "tasks",
		choices: tasks.map((task, index) => ({
			name: `${task.label} ${task.title}`,
			value: {index, task},
			disabled: !force && task.directory !== undefined ? () => "already installed" : () => false,
			checked: next !== null && index === next.index
		}))
	}]) as { tasks: Array<{ index: number, task: Task }> }).tasks;
}

/**
 * まだディレクトリが作成されていない問題のうち、最も上のものを得る
 * すべての問題のディレクトリが作成済みの場合はnullを返す
 * @param tasks
 */
function getNextTask2Install(tasks: Array<Task>): { index: number, task: Task } | null {
	for (let i = 0; i < tasks.length; i++) {
		if (tasks[i].directory === undefined) {
			return {index: i, task: tasks[i]};
		}
	}
	return null;
}

export async function getTemplateList() {
	console.error(SGR(`search template directories in ${await getConfigDirectory()}`, 37));
	const templates = await getTemplates();
	console.log(formatAsShellOutput([[SGR("NAME", 1), "SUBMIT-PROGRAM"]].concat(templates.map(template => [SGR(template.name, 1), template.task.submit]))));
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
