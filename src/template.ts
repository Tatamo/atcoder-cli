import {promisify} from "util";
import {readFile, readdir} from "fs";
import {resolve} from "path";
import {getConfigDirectory} from "./config";

export const TEMPLATE_JSON_FILE_NAME = "template.json";

// string: ファイル名
// [string, string]: コピー元ファイル名、コピー先ファイル名(フォーマット形式含む)
export type FileName2Copy = string | [string, string];

export interface RawTemplate {
	submit: string;
	program: Array<FileName2Copy>;
	static?: Array<FileName2Copy>;
	cmd?: string;
	testdir?: string;
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
	const validate = ajv.compile(await import("../acc-template-schema.json"));
	const valid = validate(data);
	if (!valid) return [false, ajv.errorsText(validate.errors)];
	return [true, null];
}
