import {AtCoder} from "../../src/atcoder";
import {disableCookieFileIO, mockLoginPrompt} from "../utils";
import { AtCoderDesign } from "../../src/di";
import { TestSession } from "../utils/session";
import { addNonLoggedInCheckMock, addLoginPageMock, addLoggedInCheckMock, registerContetstPageMock } from "../utils/responseMock";

// ログイン情報が実際にコンフィグファイルに書き込まれないようにする
disableCookieFileIO();

// テスト用のAtCoderインスタンスとTestSessionインスタンスを生成
const getTestAtCoder = async () => {
	const { container: {atcoder, session} } = await AtCoderDesign
		.bind('session', ()=> new TestSession())
		.resolve({});
	return {
		atcoder,
		session
	};
};

const mockAuth = {username: "TestUser", password: "secret"};

test("AtCoder Login", async () => {
	const { atcoder, session } = await getTestAtCoder();

	addNonLoggedInCheckMock(session);
	addLoginPageMock(session);
	mockLoginPrompt(atcoder, mockAuth);

	expect(await atcoder.checkSession()).toBe(false);
	expect(await atcoder.login()).toBe(true);

	addLoggedInCheckMock(session);

	expect(await atcoder.checkSession(true)).toBe(true);
});

describe("AtCoder get information", () => {
	// 使用前にbeforeAllで代入される
	let atcoder!: AtCoder;
	let session!: TestSession;
	beforeAll(async () => {
		if (!atcoder) {
			({atcoder, session} = await getTestAtCoder());
		}
		addNonLoggedInCheckMock(session);
		addLoginPageMock(session);
		mockLoginPrompt(atcoder, mockAuth);
		await atcoder.login();
		addLoggedInCheckMock(session);
		registerContetstPageMock(session);
	});
	describe("contest and tasks", ()=> {
		const contests = ["aic987"];
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
		const tasks = [["aic987", "aic987_a"], ["aic987", "aic987_b"], ["aic987", "aic987_c"]];
		describe("task", () => {
			test.each(tasks)("%s %s", async (contest_id, task_id) => {
				expect(await atcoder.task(contest_id, task_id)).toMatchSnapshot();
			});
			test("invalid contest id", async () => {
				await expect(atcoder.task("abc0xx", "abc0xx_z")).rejects.toThrow();
			});
			test("invalid task id", async () => {
				await expect(atcoder.task("aic987", "aic999_a")).rejects.toThrow();
			});
		});
	});
});
