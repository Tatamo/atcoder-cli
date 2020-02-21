import * as template from "../../src/template";
import {Contest} from "../../src/project";
import {AtCoder} from "../../src/atcoder";
import {getConfigDirectory} from "../../src/config";
import {importFsExtra} from "../../src/imports";
import {resolve} from "path";
import {promisify} from "util";
import {readFile, readdir} from "fs";
import fs_extra from "fs-extra";
import mock from "mock-fs";
import child_process from "child_process";

jest.mock("../../src/config");
jest.mock("../../src/imports");

const mock_template: template.RawTemplate = {
	contest: {
		static: [["gitignore", ".gitignore"]]
	},
	task: {
		submit: "main.cpp",
		program: ["main.cpp"]
	}
};
const mock_template_json = JSON.stringify(mock_template);
const mock_templates: Array<{ name: string, template: template.RawTemplate }> = [
	{
		name: "cpp",
		template: mock_template
	},
	{
		name: "ts",
		template: {
			contest: {
				static: ["package.json", ["gitignore", ".gitignore"]],
				cmd: "npm install"
			},
			task: {
				submit: "{TaskID}.ts",
				program: [["main.ts", "{TaskID}.ts"]],
				static: ["foo.txt", ["bar.txt", "{alphabet}_{TaskID}"], ["baz.txt", "{CONTESTID}-{index1}.txt"]],
				cmd: "echo $TASK_ID",
				testdir: "tests-{TaskLabel}"
			}
		}
	}
];
const templates2files = (templates: Array<{ name: string, template: template.RawTemplate }>) => templates.reduce(
	(o, {name, template}) => ({
		...o,
		[name]: {"template.json": JSON.stringify(template)}
	}), {});

const DUMMY_CONFIG_DIRECTORY_PATH = "/config/dir/of/acc";
const DUMMY_WORKING_DIRECTORY_PATH = "/current/working/directory/to/solve/problems";

// TODO: もっと適当な場所に定義を移す
const dummy_contest: Contest = {
	id: "aic987",
	title: "AtCoder Imaginary Contest 987",
	url: AtCoder.getContestURL("aic987")
};

describe("template", () => {
	beforeAll(async () => {
		// 常に同じpathを返すようにしておく
		// @ts-ignore: dynamically added method for test
		getConfigDirectory.mockResolvedValue(DUMMY_CONFIG_DIRECTORY_PATH);

		// dynamic import in a mocked filesystem causes errors
		// @ts-ignore: dynamically added method for test
		importFsExtra.mockResolvedValue(fs_extra);
	});
	beforeEach(() => {
		// clear mock call log
		jest.clearAllMocks();
	});
	describe("validateTemplateJSON", () => {
		test("valid", async () => {
			const [valid, error] = await template.validateTemplateJSON(JSON.parse(mock_template_json));
			expect(valid).toBe(true);
			expect(error).toBe(null);
		});
		test("invalid", async () => {
			// TODO: そもそもinvalidなものはany型でなければ入れられないのでおかしい
			const data: any = {task: {}};
			const [valid, error] = await template.validateTemplateJSON(data);
			expect(valid).toBe(false);
			expect(error).toMatchSnapshot();
		});
	});
	describe("getTemplate", () => {
		test("valid template", async () => {
			mock({
				[DUMMY_CONFIG_DIRECTORY_PATH]: {
					"template01": {
						"template.json": mock_template_json
					}
				}
			});
			expect(await template.getTemplate("template01")).toEqual({name: "template01", ...mock_template});
			mock.restore();
		});
		test("invalid template", async () => {
			mock({
				[DUMMY_CONFIG_DIRECTORY_PATH]: {
					"template02": {
						/* lack of required property "task" */
						"template.json": JSON.stringify({
							contest: {
								cmd: "echo hi"
							}
						})
					}
				}
			});
			await expect(template.getTemplate("template02")).rejects.toThrowError();
			mock.restore();
		})
	});
	describe("getTemplates", () => {
		test("get all templates", async () => {
			const templates = [];
			mock({
				[DUMMY_CONFIG_DIRECTORY_PATH]: templates2files(mock_templates)
			});
			const result = await template.getTemplates();
			// restore mock before toMatchSnapshot()
			// Otherwise, jest cannot detect the exist snapshot and the test always passes
			mock.restore();
			expect(result).toMatchSnapshot();
		});
		test("no template.json in directory", async () => {
			const templates = [];
			mock({
				[DUMMY_CONFIG_DIRECTORY_PATH]: {
					...templates2files(mock_templates),
					// add directory without template.json
					"non-template": {
						"this-is-not-template.json": JSON.stringify({
							task: {
								submit: "main.cpp",
								program: ["main.cpp"]
							}
						})
					}
				}
			});
			const result = await template.getTemplates();
			mock.restore();
			// there's no template "non-template"
			expect(result).toMatchSnapshot();
		});
		test("files to be ignored", async () => {
			// mock console.error to avoid https://github.com/tschaub/mock-fs/issues/234
			const spy = jest.spyOn(console, "error").mockImplementation(() => null);
			const templates = [];
			mock({
				[DUMMY_CONFIG_DIRECTORY_PATH]: {
					...templates2files(mock_templates),
					// unrelated files in config directory
					"foo.txt": "I am a text file, unrelated to templates!",
					"config.json": JSON.stringify({
						"default-task-choice": "next"
					})
				}
			});

			const result = await template.getTemplates();
			mock.restore();
			// there's no template "non-template"
			expect(result).toMatchSnapshot();
			spy.mockRestore();
		});
		test("invalid template", async () => {
			const templates = [];
			mock({
				[DUMMY_CONFIG_DIRECTORY_PATH]: {
					...templates2files(mock_templates),
					"invalid": {
						// add invalid template
						"template.json": JSON.stringify({
							contest: {
								cmd: "echo ho"
							}
						})
					}
				}
			});
			// NOTE: そもそもここでエラーを出すのは正しいのか？ (警告メッセージを出すなどする？)
			await expect(template.getTemplates()).rejects.toThrowError();
			mock.restore();
		});
	});
	describe("installContestTemplate", () => {
		test("overwrite static files", async () => {
			mock({
				[DUMMY_CONFIG_DIRECTORY_PATH]: {
					"template01": {
						"template.json": mock_template_json,
						"gitignore": ".git/"
					}
				},
				[DUMMY_WORKING_DIRECTORY_PATH]: {
					".gitignore": "this .gitignore will be overwritten by installing of the template"
				}
			});
			// cd to (mocked) current directory
			process.chdir(DUMMY_WORKING_DIRECTORY_PATH);
			expect(process.cwd()).toEqual(DUMMY_WORKING_DIRECTORY_PATH);

			const template01 = await template.getTemplate("template01");
			expect(await template01).toEqual({name: "template01", ...mock_template});

			expect(await promisify(readdir)(DUMMY_WORKING_DIRECTORY_PATH)).toEqual([".gitignore"]);
			expect(await promisify(readFile)(resolve(DUMMY_WORKING_DIRECTORY_PATH, ".gitignore"), "utf-8")).toEqual("this .gitignore will be overwritten by installing of the template");
			await template.installContestTemplate(dummy_contest, template01, DUMMY_WORKING_DIRECTORY_PATH, false);
			expect(await promisify(readdir)(DUMMY_WORKING_DIRECTORY_PATH)).toEqual([".gitignore"]);
			expect(await promisify(readFile)(resolve(DUMMY_WORKING_DIRECTORY_PATH, ".gitignore"), "utf-8")).toEqual(".git/");

			mock.restore();
		});
		test("exec command", async () => {
			// mock console.error to avoid https://github.com/tschaub/mock-fs/issues/234
			const spy_console_log = jest.spyOn(console, "log").mockImplementation(() => null);
			const spy_console_error = jest.spyOn(console, "error").mockImplementation(() => null);

			const spy_exec = jest.spyOn(child_process, "exec");
			mock({
				[DUMMY_WORKING_DIRECTORY_PATH]: {}
			});

			// cd to (mocked) current directory
			process.chdir(DUMMY_WORKING_DIRECTORY_PATH);
			expect(process.cwd()).toEqual(DUMMY_WORKING_DIRECTORY_PATH);

			const template02 = {name: "template02", contest: {cmd: "echo $CONTEST_ID"}, task: mock_template.task};
			await template.installContestTemplate(dummy_contest, template02, DUMMY_WORKING_DIRECTORY_PATH, true);

			mock.restore();
			expect(spy_exec).toBeCalledTimes(1);
			const test_env = {
				TEMPLATE_DIR: resolve(DUMMY_CONFIG_DIRECTORY_PATH, "template02"),
				// TODO: こちらが正しいのでは？
				// CONTEST_DIR: resolve(DUMMY_WORKING_DIRECTORY_PATH, dummy_contest.id),
				CONTEST_DIR: DUMMY_WORKING_DIRECTORY_PATH,
				CONTEST_ID: dummy_contest.id
			};
			expect(spy_exec.mock.calls[0][0]).toEqual("echo $CONTEST_ID");
			expect(spy_exec.mock.calls[0][1]).toEqual({env: expect.objectContaining(test_env)});
			spy_console_log.mockRestore();
			spy_console_error.mockRestore();
			spy_exec.mockRestore();
		});
	});
});
