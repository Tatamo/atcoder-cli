import * as template from "../../src/template";
import {getConfigDirectory} from "../../src/config";
import mock from "mock-fs";
jest.mock("../../src/config");

const mock_template = {
	contest: {
		static: [["gitignore", ".gitignore"]]
	},
	task: {
		submit: "main.cpp",
		program: ["main.cpp"]
	}
};
const mock_template_json = JSON.stringify(mock_template);

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
	test("getTemplate", async () => {
		mock({
			[`${DUMMY_CONFIG_DIRECTORY_PATH}/template01`]:{
				"template.json" : mock_template_json
			}
		});
		expect(await template.getTemplate("template01")).toEqual({name:"template01", ...mock_template});
		mock.restore();
	});
});
