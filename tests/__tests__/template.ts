import * as template from "../../src/template";
import {getConfigDirectory} from "../../src/config";
import * as fs from "fs";

jest.mock("fs");
jest.mock("../../src/config");

describe("template", () => {
	beforeAll(async () => {
		// 常に同じpathを返すようにしておく
		// @ts-ignore: dynamically added method for test
		getConfigDirectory.mockResolvedValue("/config/dir/of/acc");

	});
	describe("validateTemplateJSON", () => {
		test("valid", async () => {
			const [valid, error] = await template.validateTemplateJSON({
				contest: {
					static: [["gitignore", ".gitignore"]]
				},
				task: {
					submit: "main.cpp",
					program: ["main.cpp"]
				}
			});
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
		// not implemented
		// TODO: mock fs to write test
	});
});
