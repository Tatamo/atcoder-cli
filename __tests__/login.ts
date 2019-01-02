import {username, password} from "./auth.json";
import inquirer from "inquirer";
import {AtCoder} from "../src/atcoder";
import {Cookie} from "../src/cookie";

jest.mock("inquirer");

/*
 * Cookieファイルの実装を差し替えておく
 * コンフィグファイルとの読み書きを行わず、必ず空のセッションが返るようにする
 */
Cookie.prototype.loadConfigFile = jest.fn(async function () {
	// @ts-ignore
	this.cookies = []
});
Cookie.prototype.saveConfigFile = jest.fn(async function () {
});

/*
 このテストが失敗する場合、まず以下の点を確認してください
 - __tests__/auth.json が存在し、正しいユーザー名とパスワードが記述されていること
   すべてのテストを開始する前に、__tests__/auth.example.jsonをコピーして__tests__/auth.json を作成し、
   有効なAtCoderアカウントのユーザー名とパスワードを記述してください
   __tests__/auth.jsonはgit管理に含めないように注意してください
 */
test("AtCoder Login", async () => {
	const atcoder = new AtCoder();
	expect(await atcoder.checkSession()).toBe(false);

	// ユーザー名とパスワードを標準入力で受け付けるかわりにファイルから流し込むようモックする
	// @ts-ignore
	inquirer.prompt.mockResolvedValueOnce({username, password});

	expect(await atcoder.login()).toBe(true);
	expect(await atcoder.checkSession(true)).toBe(true);
});
