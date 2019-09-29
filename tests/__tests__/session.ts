import {SessionDesign} from "../../src/di/index";
import {Cookie} from "../../src/cookie";
import {disableCookieFileIO} from "../utils";
import axios from "axios";
import {AtCoder} from "../../src/atcoder";

// mock axios
jest.mock("axios");
// axios.createで作成されるインスタンスもモックに差し替える
axios.create = jest.fn(() => axios);

const getTestSession = async () => {
	const {container: {session}} = await SessionDesign
		.bind('CookieConstructor', () => {
			disableCookieFileIO();
			return Cookie;
		})
		.resolve({});
	return session;
};

describe("Session", () => {
	beforeAll(() => {
		// @ts-ignore: dynamically added method for test
		axios.mockResolvedValue({
			status: 200,
			statusText: "OK",
			headers: {
				"content-type": "text/html; charset=utf-8",
				"set-cookie": [
					"TEST_COOKIE1=1; Path=/; HttpOnly",
					"TEST_COOKIE2=abc; Max-Age=86400; HttpOnly"
				]
			},
			data: `<body><p>empty</p></body>`
		});
		// @ts-ignore: dynamically added method for test
		axios.post.mockResolvedValue({
			status: 302,
			statusText: "Found",
			location: "/",
			headers: {
				"set-cookie": [
					"TEST_COOKIE1=3; Path=/; HttpOnly",
					"TEST_COOKIE2=xyz; Max-Age=86400; HttpOnly"
				]
			},
			data: `<body><p>empty</p></body>`
		});
	});
	beforeEach(() => {
		// モック関数の呼び出し履歴をリセット
		jest.clearAllMocks();
	});
	test("get", async () => {
		const session = await getTestSession();
		const result = await session.get(AtCoder.getContestURL("aic987"));
		expect(result).toMatchSnapshot();
	});
	test("post", async () => {
		const session = await getTestSession();
		const result = await session.post(AtCoder.login_url);
		expect(result).toMatchSnapshot();
	});
	describe("transaction", () => {
		// transactionが正常に終了するまではCookieがファイルに保存されない
		test("nop", async () => {
			const session = await getTestSession();
			await session.transaction(async () => {
			});
			// @ts-ignore: dynamically added property for test
			expect(Cookie.prototype.saveConfigFile.mock.calls.length).toBe(0);
			expect((await session.getCookies()).get()).toEqual([]);
		});
		test("saveSession", async () => {
			const session = await getTestSession();
			await session.transaction(async () => {
				await (await session.get(AtCoder.getContestURL("aic987"))).saveSession();
				await (await session.get(AtCoder.getTaskURL("aic987"))).saveSession();
				await (await session.post(AtCoder.login_url)).saveSession();
				// saveSession()を複数回呼び出しても、Cookieのファイルへの保存は行われない
				// @ts-ignore: dynamically added property for test
				expect(Cookie.prototype.saveConfigFile.mock.calls.length).toBe(0);
			});
			// transaction終了時に一度だけsaveConfigFile()が呼び出される
			// @ts-ignore: dynamically added property for test
			expect(Cookie.prototype.saveConfigFile.mock.calls.length).toBe(1);
			expect((await session.getCookies()).get()).toMatchSnapshot();
		});
		test("removeSession", async () => {
			const session = await getTestSession();
			await session.transaction(async () => {
				await (await session.post(AtCoder.login_url)).saveSession();
				await session.removeSession();
				// @ts-ignore: dynamically added property for test
				expect(Cookie.prototype.saveConfigFile.mock.calls.length).toBe(0);
			});
			// @ts-ignore: dynamically added property for test
			expect(Cookie.prototype.saveConfigFile.mock.calls.length).toBe(1);
			expect((await session.getCookies()).get()).toEqual([]);
		});
		test("transaction in transaction", async () => {
			const session = await getTestSession();
			await expect(
				session.transaction(async () => {
					await session.transaction(async () => {
						await (await session.post(AtCoder.login_url)).saveSession();
					})
				})
			).rejects.toThrow();
		});
		test("throw", async () => {
			const session = await getTestSession();
			await (await session.post(AtCoder.login_url)).saveSession();
			expect((await session.getCookies()).get()).toMatchSnapshot();
			const before = (await session.getCookies()).get();
			try {
				await session.transaction(async () => {
					await (await session.get(AtCoder.getContestURL("aic987"))).saveSession();
					throw new Error("");
				})
			} catch (e) {
				// do nothing
			}
			// transaction中にエラーが発生するとCookieの更新は巻き戻される
			expect((await session.getCookies()).get()).toEqual(before);
		})
	});
	test("removeSession", async () => {
		const session = await getTestSession();
		const result = await session.post(AtCoder.login_url);
		// @ts-ignore: dynamically added property for test
		expect(Cookie.prototype.saveConfigFile.mock.calls.length).toBe(0);
		await result.saveSession();
		expect((await session.getCookies()).get()).toMatchSnapshot();
		// @ts-ignore: dynamically added property for test
		expect(Cookie.prototype.saveConfigFile.mock.calls.length).toBe(1);
		// removeSession()の呼び出しにより、保存されたCookieが破棄される
		await session.removeSession();
		expect((await session.getCookies()).get()).toEqual([]);
		// @ts-ignore: dynamically added property for test
		expect(Cookie.prototype.saveConfigFile.mock.calls.length).toBe(2);
	});
});
