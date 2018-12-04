import {promisify} from "util";
import {readFile, readdir} from "fs";
import {resolve} from "path";
import {getConfigDirectory} from "./config";
import child_process from "child_process";
import {Contest, DetailedTask, formatContestDirname, formatTaskDirname} from "./project";

export const TEMPLATE_JSON_FILE_NAME = "template.json";

// string: ファイル名
// [string, string]: コピー元ファイル名、コピー先ファイル名(フォーマット形式含む)
export type FileName2Copy = string | [string, string];

export interface RawTemplate {
	contest?: {
		static?: Array<FileName2Copy>;
		cmd?: string;
	}
	task: {
		submit: string;
		program: Array<FileName2Copy>;
		static?: Array<FileName2Copy>;
		cmd?: string;
		testdir?: string;
	}
}

export interface Template extends RawTemplate {
	name: string;
}

/**
 * テンプレート名を指定してテンプレートを取得する
 * @param name
 * @throws Error バリデーションに失敗、またはファイル・ディレクトリが存在しない場合エラーとなる
 */
export async function getTemplate(name: string): Promise<Template> {
	const configdir = await getConfigDirectory();
	const template = JSON.parse(await promisify(readFile)(resolve(configdir, name, TEMPLATE_JSON_FILE_NAME), "utf8"));
	const [valid, error] = await validateTemplateJSON(template);
	if (!valid) {
		throw new Error(error!);
	}
	return {name, ...template};
}

/**
 * コンフィグディレクトリ全体を走査してテンプレートディレクトリを取得する
 */
export async function getTemplates(): Promise<Array<Template>> {
	const configdir = await getConfigDirectory();
	const files: Array<string> = await promisify(readdir)(configdir);
	const templates = [];
	for (const name of files) {
		try {
			// ファイル名をディレクトリ名とみなして直下のJSONファイルを取得
			const template = await getTemplate(name);
			templates.push(template);
		} catch (e) {
			// ディレクトリでないファイルなど、ENOTDIR, ENOENTエラーが発生した場合はそのまま無視
			if (e.code !== "ENOTDIR" && e.code !== "ENOENT") console.error(`Error occurred in ${resolve(name, TEMPLATE_JSON_FILE_NAME)}:\n  ${e.toString()}`);
		}
	}
	return templates;
}

/**
 * テンプレートファイルが正しい形式に沿っているか調べる
 * [valid:true, error:null] | [valid:false, error:string] valid=trueなら正しいJSON
 * @param data
 */
export async function validateTemplateJSON(data: RawTemplate): Promise<[true, null] | [false, string]> {
	const ajv = new ((await import("ajv")).default)();
	const validate = ajv.compile(await import("../schema/acc-template-schema.json"));
	const valid = validate(data);
	if (!valid) return [false, ajv.errorsText(validate.errors)];
	return [true, null];
}

/**
 * コンテストテンプレートを展開する
 * @param contest
 * @param template
 * @param contest_path
 * @param log default=false trueなら通常ログを標準出力に表示させる falseの場合はエラーログのみをエラー出力に表示
 */
export async function installContestTemplate(contest: Contest, template: Template, contest_path: string, log: boolean = false) {
	const contest_template = template.contest;
	if (contest_template === undefined) throw new Error("no contest template is given");
	// 現在のディレクトリを記憶しつつ展開先ディレクトリに移動する
	const pwd = process.cwd();
	process.chdir(contest_path);
	const template_dir = resolve(await getConfigDirectory(), template.name);
	const fs = (await import("fs-extra"));

	// 静的ファイルのコピー
	// 同名ファイルが存在した場合は上書きされる
	if (contest_template.static !== undefined) {
		for (const file of contest_template.static) {
			const source = resolve(template_dir, typeof file === "string" ? file : file[0]);
			const dest = resolve(process.cwd(), typeof file === "string" ? file : formatContestDirname(file[1], contest));
			try {
				await fs.copy(source, dest);
			} catch (e) {
				console.error(e.toString());
			}
			if (log) console.log(`"${source}" -> "${dest}"`)
		}
	}

	// コマンドの実行
	if (contest_template.cmd !== undefined) {
		if (log) console.log(`Command:\n  exec \`${contest_template.cmd}\``);
		// 環境変数としてパラメータを利用可能にする
		const env = {
			...process.env,
			TEMPLATE_DIR: template_dir,
			CONTEST_DIR: contest_path,
			CONTEST_ID: contest.id
		};
		const {stdout, stderr} = await promisify(child_process.exec)(contest_template.cmd, {env});
		if (log && stdout !== "") console.log(stdout);
		if (stderr !== "") console.error(stderr);
	}

	// もとのディレクトリに戻る
	process.chdir(pwd);
}

/**
 * 問題テンプレートを展開する
 * @param detailed_task
 * @param paths コンテストおよび展開先の問題ディレクトリ
 * @param log default=false trueなら通常ログを標準出力に表示させる falseの場合はエラーログのみをエラー出力に表示
 */
export async function installTaskTemplate(detailed_task: DetailedTask, paths: { contest: string, task: string }, log: boolean = false) {
	const {task, index, contest, template} = detailed_task;
	if (template === undefined) throw new Error("no template is given");
	const task_template = template.task;
	// 現在のディレクトリを記憶しつつ展開先ディレクトリに移動する
	const pwd = process.cwd();
	process.chdir(paths.task);
	const template_dir = resolve(await getConfigDirectory(), template.name);
	const fs = (await import("fs-extra"));
	// プログラムファイルのコピー
	for (const file of task_template.program) {
		const source = resolve(template_dir, typeof file === "string" ? file : file[0]);
		const dest = resolve(process.cwd(), typeof file === "string" ? file : formatTaskDirname(file[1], task, index, contest));
		try {
			// ファイルの上書きは行わず、既にファイルが存在する場合はエラーを発生させる
			await fs.copy(source, dest, {overwrite: false, errorOnExist: true});
			if (log) console.log(`"${source}" -> "${dest}"`)
		} catch (e) {
			// ファイルのコピーを行わなかったことを通知
			console.error(`Skip: "${source}" -> "${dest}"`);
		}
	}

	// 静的ファイルのコピー
	// 同名ファイルが存在した場合は上書きされる
	if (task_template.static !== undefined) {
		for (const file of task_template.static) {
			const source = resolve(template_dir, typeof file === "string" ? file : file[0]);
			const dest = resolve(process.cwd(), typeof file === "string" ? file : formatTaskDirname(file[1], task, index, contest));
			try {
				await fs.copy(source, dest);
			} catch (e) {
				console.error(e.toString());
			}
			if (log) console.log(`"${source}" -> "${dest}"`)
		}
	}

	// コマンドの実行
	if (task_template.cmd !== undefined) {
		if (log) console.log(`Command:\n  exec \`${task_template.cmd}\``);
		// 環境変数としてパラメータを利用可能にする
		const env = {
			...process.env,
			TEMPLATE_DIR: template_dir,
			TASK_DIR: paths.task,
			TASK_ID: task.id,
			TASK_INDEX: index.toString(),
			CONTEST_DIR: paths.contest,
			CONTEST_ID: contest.id
		};
		const {stdout, stderr} = await promisify(child_process.exec)(task_template.cmd, {env});
		if (log && stdout !== "") console.log(stdout);
		if (stderr !== "") console.error(stderr);
	}

	// もとのディレクトリに戻る
	process.chdir(pwd);
}
