import {SessionDesign} from "../../src/di/index";
import {Cookie} from "../../src/cookie";
import {disableCookieFileIO} from "../utils";
import axios from "axios";
import {SessionInterface} from "../../src/session";
import {AtCoder} from "../../src/atcoder";

// mock axios
jest.mock("axios");
// axios.createで作成されるインスタンスもモックに差し替える
axios.create = jest.fn(()=>axios);

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
	test("get", async () => {
		const session = await getTestSession();
		// @ts-ignore: dynamically added method for test
		axios.mockResolvedValueOnce({
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
		const result = await session.get(AtCoder.getContestURL("aic987"));
		expect(result).toMatchSnapshot();
	});
	test("post", async () => {
		const session = await getTestSession();
		// @ts-ignore: dynamically added method for test
		axios.post.mockResolvedValueOnce({
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
		const result = await session.post(AtCoder.login_url);
		expect(result).toMatchSnapshot();
	});
});
