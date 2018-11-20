import {promisify} from "util";
import {readFile, readdir} from "fs";
import {resolve} from "path";

export const TEMPLATE_JSON_FILE_NAME = "template.json";

export interface Template {
	submit: string;
	program: Array<string>;
	static?: Array<string>;
	cmd?: string;
	testdir?: string;
}

/**
 * ディレクトリ全体を走査してテンプレートディレクトリを取得する
 * @param path
 */
export async function getTemplates(path: string): Promise<Array<{ name: string, template: Template }>> {
	const files: Array<string> = await promisify(readdir)(path);
	const templates = [];
	for (const name of files) {
		try {
			// ファイル名をディレクトリ名とみなして直下のJSONファイルを取得
			const template = JSON.parse(await promisify(readFile)(resolve(path, name, TEMPLATE_JSON_FILE_NAME), "utf8"));
			const [valid, error] = await validateTemplateJSON(template);
			if (valid) {
				templates.push({name, template});
			}
			else {
				console.error(`validation error in ${resolve(name, TEMPLATE_JSON_FILE_NAME)}:\n  ${error}`);
			}
		} catch (e) {
			// ディレクトリでないファイルなど、ENOTDIR, ENOENTエラーが発生した場合はそのまま無視
			if (e.code !== "ENOTDIR" && e.code !== "ENOENT") console.error(`Error occurred in ${resolve(name, TEMPLATE_JSON_FILE_NAME)}:\n  ${e.toString()}`);
		}
	}
	return templates;
}

/**
 * プロジェクトファイルが正しい形式に沿っているか調べる
 * [valid:true, error:null] | [valid:false, error:string] valid=trueなら正しいJSON
 * @param data
 */
export async function validateTemplateJSON(data: Template): Promise<[true, null] | [false, string]> {
	const ajv = new ((await import("ajv")).default)();
	const validate = ajv.compile((await import("./schema")).template_schema);
	const valid = validate(data);
	if (!valid) return [false, ajv.errorsText(validate.errors)];
	return [true, null];
}
