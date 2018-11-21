import {Task, ContestProject, Contest} from "./definitions";
import {AtCoder} from "./atcoder";
import {mkdir, readFile, writeFile} from "fs";
import {sep, resolve} from "path";
import mkdirp from "mkdirp";
import {promisify} from "util";
import {OnlineJudge} from "./facade/oj";
import getConfig from "./config";
import {Template} from "./template";

export const PROJECT_JSON_FILE_NAME = "contest.acc.json";

/**
 * 指定したディレクトリから親を辿って最も近い位置にあるプロジェクトファイルを取得する
 * 見つからなかった場合は例外を発生させる
 * @param path 省略するとカレントディレクトリを使用
 */
export async function findProjectJSON(path?: string): Promise<{ path: string, data: ContestProject }> {
	const readFilePromise = promisify(readFile);
	let cwd = path !== undefined ? path : process.cwd();

	const data: ContestProject =
		await (async () => {
			let data = null;
			while (true) {
				try {
					let filepath = resolve(cwd, PROJECT_JSON_FILE_NAME);
					data = JSON.parse(await readFilePromise(filepath, "utf8"));
					return data;
				} catch (e) {
					if (e.code === "ENOENT") {
						// ファイルが存在しないので上の階層を探す
						const parent = resolve(cwd, "..");
						if (parent === cwd) {
							throw new Error(`${PROJECT_JSON_FILE_NAME} not found.`);
						}
						cwd = parent;
					}
					else {
						throw e;
					}
				}
			}
		})();
	const [valid, error] = await validateProjectJSON(data);
	if (valid) return {path: cwd, data};
	else throw new Error(`failed to validate JSON: ${error!}`);
}

/**
 * プロジェクトファイルを探し、現在のディレクトリ構造からコンテストと問題を特定する
 * @param path? 省略するとカレントディレクトリを使用
 */
export async function detectTaskByPath(path?: string): Promise<{ contest: Contest | null, task: Task | null }> {
	if (path === undefined) path = process.cwd();
	try {
		const {path: project_path, data: {contest, tasks}} = await findProjectJSON();
		if (path === project_path) {
			// ブロジェクトディレクトリとカレントディレクトリが一致
			return {contest, task: null};
		}
		// projectディレクトリの一つ下の階層のディレクトリ名を取得
		const dirname = path.split(sep)[project_path.split(sep).length];
		let task = null;
		for (const t of tasks) {
			if (t.directory !== undefined) {
				if (resolve(project_path, t.directory.path) === resolve(project_path, dirname)) {
					task = t;
					break;
				}
			} else {
				// directoryプロパティが存在しない場合はidと一致していると仮定
				if (t.id === dirname) {
					task = t;
					break;
				}
			}
		}
		return {contest, task};
	} catch {
		return {contest: null, task: null};
	}
}

/**
 * プロジェクトJSONファイルを保存する
 * @param data ContestProject
 * @param directory_path 省略した場合は自動的にプロジェクトディレクトリを探してプロジェクトファイルを上書きする
 */
export async function saveProjectJSON(data: ContestProject, directory_path?: string): Promise<void> {
	if (directory_path === undefined) directory_path = (await findProjectJSON()).path;
	if (directory_path === undefined) throw new Error("Cannot find project directory path");
	const [valid, error] = await validateProjectJSON(data);
	if (valid) {
		const json_data = JSON.stringify(data, undefined, 2);
		await promisify(writeFile)(resolve(directory_path, PROJECT_JSON_FILE_NAME), json_data);
	}
	else {
		console.error("JSON validation failed:");
		throw new Error(error!);
	}
}

/**
 * プロジェクトファイルが正しい形式に沿っているか調べる
 * [valid:true, error:null] | [valid:false, error:string] valid=trueなら正しいJSON
 * @param data
 */
export async function validateProjectJSON(data: ContestProject): Promise<[true, null] | [false, string]> {
	const ajv = new ((await import("ajv")).default)();
	const schema = (await import("./schema")).default;
	const validate = ajv.compile(schema);
	const valid = validate(data);
	if (!valid) return [false, ajv.errorsText(validate.errors)];
	return [true, null];
}

/**
 * コンテスト情報を取得し、プロジェクトディレクトリを作成する
 * @param contest_id
 * @param options
 */
export async function init(contest_id: string, options: { force?: boolean, contestDirnameFormat?: string }): Promise<ContestProject> {
	const atcoder = new AtCoder();
	if (!await atcoder.checkSession()) await atcoder.login();
	const [contest, tasks] = await Promise.all([atcoder.contest(contest_id), atcoder.tasks(contest_id)]).catch(() => [null, null]);
	if (contest === null || tasks === null) {
		throw new Error("failed to get contest information.");
	}
	const format = options.contestDirnameFormat !== undefined ? options.contestDirnameFormat : (await getConfig()).get("default-contest-dirname-format");
	const dirname = formatContestDirname(format, contest);
	try {
		await promisify(mkdir)(dirname);
	}
	catch {
		// forceオプションがtrueでない場合のみエラーで停止する
		if (options.force !== true) {
			throw new Error(`${dirname} file/directory already exists.`)
		}
	}
	process.chdir(dirname);
	const data = {contest, tasks};
	await saveProjectJSON(data, process.cwd());
	console.log(`${dirname}/${PROJECT_JSON_FILE_NAME} created.`);
	return data;
}

export async function installTask(task: Task, index: number, contest: Contest, dirname: string, project_path: string, template?: Template): Promise<Task> {
	const pwd = process.cwd();
	await promisify(mkdirp)(project_path);
	process.chdir(project_path);
	await promisify(mkdirp)(dirname);
	process.chdir(dirname);

	const testdir = formatTaskDirname(template !== undefined && template.testdir !== undefined ? template.testdir : (await getConfig()).get("default-test-dirname-format"), task, index, contest);

	if (OnlineJudge.checkAvailable()) {
		await OnlineJudge.call(["dl", task.url, "-d", testdir]);
	} else {
		console.error("online-judge-tools is not available. downloading of sample cases skipped.");
	}
	// もとのディレクトリに戻る
	process.chdir(pwd);
	return Object.assign(task, {directory: {path: dirname, testdir}});
}

export function formatContestDirname(format: string, contest: Contest): string {
	const convert = (pattern: string): string => {
		switch (pattern) {
			case "ContestID":
				return contest.id;
			case "CONTESTID":
				return contest.id.toUpperCase();
			case "TailNumberOfContestID":
				const result = /\d+$/.exec(contest.id);
				return result === null ? "" : result[0];
			case "ContestTitle":
				return contest.title;
		}
		throw new Error(`pattern "{${pattern}} is not defined. use --help option to get more information."`);
	};
	return format.replace(/{([a-zA-Z0-9]+)}/g, (_, p) => convert(p));
}

export function formatTaskDirname(format: string, task: Task, index: number, contest: Contest): string {
	const convert = (pattern: string): string => {
		switch (pattern) {
			case "TaskLabel":
				return task.label;
			case "tasklabel":
				return task.label.toLowerCase();
			case "TASKLABEL":
				return task.label.toUpperCase();
			case "TaskID":
				return task.id;
			case "TASKID":
				return task.id.toUpperCase();
			case "TaskTitle":
				return task.title;
			case "ContestID":
				return contest.id;
			case "CONTESTID":
				return contest.id.toUpperCase();
			case "TailNumberOfContestID":
				const result = /\d+$/.exec(contest.id);
				return result === null ? "" : result[0];
			case "ContestTitle":
				return contest.title;
			case "index0":
				return index.toString();
			case "index1":
				return (index + 1).toString();
			case "alphabet":
				return convertNumber2Alphabet(index);
			case "ALPHABET":
				return convertNumber2Alphabet(index).toUpperCase();
		}
		throw new Error(`pattern "{${pattern}} is not defined. use --help option to get more information."`);
	};
	return format.replace(/{([a-zA-Z0-9]+)}/g, (_, p) => convert(p));
}

/**
 * 数値をアルファベットに変換する
 * 0,1,2,... => a,b,c,...,z,aa,ab,...
 * @param num
 */
function convertNumber2Alphabet(num: number): string {
	if (num < 0) throw new Error("invalid number");
	let result = "";
	do {
		result = ((num % 26) + 10).toString(36) + result;
	} while ((num = Math.floor(num / 26) - 1) >= 0);
	return result;
}
