import * as template from "../../src/template";
import {getConfigDirectory} from "../../src/config";
import mock from "mock-fs";

jest.mock("../../src/config");

const mock_template:template.RawTemplate = {
	contest: {
		static: [["gitignore", ".gitignore"]]
	},
	task: {
		submit: "main.cpp",
		program: ["main.cpp"]
	}
};
const mock_template_json = JSON.stringify(mock_template);
const mock_templates:Array<{ name: string, template: template.RawTemplate }> = [
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
				program: ["main.ts", "{TaskID}.ts"],
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

describe("template", () => {
	beforeAll(async () => {
		// 常に同じpathを返すようにしておく
		// @ts-ignore: dynamically added method for test
		getConfigDirectory.mockResolvedValue(DUMMY_CONFIG_DIRECTORY_PATH);

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
});
