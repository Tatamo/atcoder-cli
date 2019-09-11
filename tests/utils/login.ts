import {AtCoder} from "../../src/atcoder";
import inquirer from "inquirer";
jest.mock("inquirer");

/**
 * 標準入力を求めることなくログインを行う
 */
export async function mockLogin(atcoder: AtCoder, {username, password}: { username: string, password: string }) {
	// ユーザー名とパスワードを標準入力で受け付けるかわりに、JSONファイルから取得した情報を流し込む
	// @ts-ignore
	inquirer.prompt.mockResolvedValueOnce({username, password});
	return await atcoder.login();
}
