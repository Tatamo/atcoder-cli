import {SessionDesign} from "../../src/di/index";
import {Cookie} from "../../src/cookie";
import {disableCookieFileIO} from "../utils";
import axios from "axios";
import {SessionInterface} from "../../src/session";
import {AtCoder} from "../../src/atcoder";

// mock axios
jest.mock("axios");
// axios.createで作成されるインスタンスもモックに差し替える
axios.create = jest.fn(() => axios);

const getTestSession = async (): Promise<SessionInterface> => {
	const {container: {session}} = await SessionDesign
		.bind('CookieConstructor', () => {
			disableCookieFileIO();
			return Cookie;
		})
		.resolve({});
	return session;
};

describe("session", () => {
	beforeAll(()=>{
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
	test("transaction", async () => {
		const session = await getTestSession();
		await session.transaction(async ()=>{
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
	})
});
