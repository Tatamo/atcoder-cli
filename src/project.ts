import {Task} from "./definitions";
import {AtCoder} from "./atcoder";
import {mkdir, readFile, writeFile} from "fs";
import path from "path";
import mkdirp from "mkdirp";
import {promisify} from "util";
import {OnlineJudge} from "./facade/oj";

export const PROJECT_JSON_FILE_NAME = "contest.acc.json";

/**
 * カレントディレクトリから親を辿って最も近い位置にあるプロジェクトファイルを取得する
 * 見つからなかった場合は例外を発生させる
 */
export const findProjectJSON = async (): Promise<{ path: string, data: any }> => {
	const readFilePromise = promisify(readFile);
	let cwd = process.cwd();

	let data = null;
	while (true) {
		try {
			let filepath = path.resolve(cwd, PROJECT_JSON_FILE_NAME);
			data = JSON.parse(await readFilePromise(filepath, "utf8"));
			break;
		} catch (e) {
			if (e.code === "ENOENT") {
				// ファイルが存在しないので上の階層を探す
				const parent = path.resolve(cwd, "..");
				if (parent === cwd) {
					throw new Error(`${PROJECT_JSON_FILE_NAME} not found`);
				}
				cwd = parent;
			}
			else {
				throw e;
			}
		}
	}
	const [valid, error] = await validateProjectJSON(data);
	if (valid) return {path: cwd, data};
	else throw new Error(error!);
};

/**
 * プロジェクトファイルが正しい形式に沿っているか調べます
 * [valid:true, error:null] | [valid:false, error:string] valid=trueなら正しいJSON
 * @param data
 */
export const validateProjectJSON = async (data: string): Promise<[true, null] | [false, string]> => {
	const ajv = new ((await import("ajv")).default)();
	const schema = (await import("./schema")).default;
	const validate = ajv.compile(schema);
	const valid = validate(data);
	if (!valid) return [false, ajv.errorsText(validate.errors)];
	return [true, null];
};

/**
 * コンテスト情報を取得し、プロジェクトディレクトリを作成する
 * @param contest_id
 */
export const init = async (contest_id: string): Promise<boolean> => {
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
	await promisify(writeFile)(PROJECT_JSON_FILE_NAME, JSON.stringify(data, undefined, 2));
	console.log(`${contest_id}/${PROJECT_JSON_FILE_NAME} created.`);
	return true;
};

export const installTask = async (task: Task, project_path?: string): Promise<void> => {
	if (project_path !== undefined) process.chdir(project_path);
	await promisify(mkdirp)(task.id);
	process.chdir(task.id);
	if (OnlineJudge.checkAvailable()) {
		await OnlineJudge.call(["dl", task.url]);
	} else {
		console.error("online-judge-tools is not available. downloading of sample cases skipped.");
	}
};
