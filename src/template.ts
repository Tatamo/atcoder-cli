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
			// TODO: validate
			templates.push({name, template});
		} catch (e) {
			// ディレクトリでないファイルなど、ENOTDIR, ENOENTエラーが発生した場合はそのまま無視
			if (e.code !== "ENOTDIR" && e.code !== "ENOENT") throw e;
		}
	}
	return templates;
}
