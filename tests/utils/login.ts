import {AtCoder} from "../../src/atcoder";
import inquirer from "inquirer";

jest.mock("inquirer");

/**
 * 標準入力を求めることなくログインを行うようにinquirerの挙動をモックする
 */
export function mockLoginPrompt(atcoder: AtCoder, {username, password}: { username: string, password: string }) {
	// ユーザー名とパスワードを標準入力で受け付けるかわりに、引数から流し込む
	// @ts-ignore: dynamically added method for test
	inquirer.prompt.mockResolvedValueOnce({username, password});
}
