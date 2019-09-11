import path from "path";
import {name as projectName} from "../package.json";

type Conf = import("conf")<string>;

export const defaults = {
	["oj-path"]: "",
	["default-contest-dirname-format"]: "{ContestID}",
	["default-task-dirname-format"]: "{tasklabel}",
	["default-test-dirname-format"]: "tests",
	["default-task-choice"]: "inquire",
	["default-template"]: ""
};

/**
 * 常に単一のConfインスタンスを返す関数
 */
const getConfig: () => Promise<Conf> = (() => {
	// confはsingletonとして扱う
	let conf: Conf | null = null;
	return async () => {
		if (conf !== null) return conf;
		const Conf = (await import("conf")).default;
		return conf = new Conf({defaults, projectName});
	}
})();

export default getConfig;

/**
 * コンフィグディレクトリを取得
 */
export async function getConfigDirectory(): Promise<string> {
	return path.resolve((await getConfig()).path, "..");
}
