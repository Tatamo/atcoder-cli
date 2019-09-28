jest.useFakeTimers();
import {username, password} from "./auth.json";
import {AtCoder} from "../../src/atcoder";
import {disableCookieFileIO, mockLogin} from "../utils";
import { productionAtCoderDesign } from "../../src/di/index.js";

// ログイン情報が実際にコンフィグファイルに書き込まれないようにする
disableCookieFileIO();

// テスト用のAtCoderインスタンスを生成（現時点ではまだproduction用と同じ）
const getTestAtCoder = async () => {
	const { container: { atcoder }} = await productionAtCoderDesign.resolve({});
	return atcoder;
}

/*
 このテストが失敗する場合、まず以下の点を確認してください
 - __tests__/auth.json が存在し、正しいユーザー名とパスワードが記述されていること
   すべてのテストを開始する前に、__tests__/auth.example.jsonをコピーして__tests__/auth.json を作成し、
   有効なAtCoderアカウントのユーザー名とパスワードを記述してください
   __tests__/auth.jsonはgit管理に含めないように注意してください
 */
test("AtCoder Login", async () => {
	const atcoder = await getTestAtCoder();
	expect(await atcoder.checkSession()).toBe(false);
	expect(await mockLogin(atcoder, {username, password})).toBe(true);
	expect(await atcoder.checkSession(true)).toBe(true);
});

describe("AtCoder get information", () => {
	// 使用前にbeforeAllで代入される
	let atcoder!: AtCoder;
	beforeAll(async () => {
		if (!atcoder) {
			atcoder = await getTestAtCoder();
		}
		await mockLogin(atcoder, {username, password});
	});
	describe("contest and tasks", ()=> {
		const contests = ["abc101", "arc101"];
		describe("contest", () => {
			test.each(contests)("%s", async (contest_id) => {
				expect(await atcoder.contest(contest_id)).toMatchSnapshot();
			});
			test("invalid contest id", async () => {
				await expect(atcoder.contest("abc0xx")).rejects.toThrow();
			});
		});
		describe("tasks", () => {
			test.each(contests)("%s", async (contest_id) => {
				expect(await atcoder.tasks(contest_id)).toMatchSnapshot();
			});
			test("invalid contest id", async () => {
				await expect(atcoder.tasks("abc0xx")).rejects.toThrow();
			});
		});
		const tasks = [["abc101", "abc101_a"], ["abc101", "abc101_b"], ["arc101", "arc101_a"]];
		describe("task", () => {
			test.each(tasks)("%s %s", async (contest_id, task_id) => {
				expect(await atcoder.task(contest_id, task_id)).toMatchSnapshot();
			});
			test("invalid contest id", async () => {
				await expect(atcoder.task("abc0xx", "abc0xx_z")).rejects.toThrow();
			});
			test("invalid task id", async () => {
				await expect(atcoder.task("abc101", "abc102_a")).rejects.toThrow();
			});
		});
	});
});
