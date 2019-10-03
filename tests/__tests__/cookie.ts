import Conf from "conf";
import {CookieDesign} from "../../src/di";
import {Cookie} from "../../src/cookie";
// mock conf
jest.mock("conf");

const getCookieConstructor = async () => (await CookieDesign.resolve({})).container.CookieConstructor;

test("getCookieConstructor", async () => {
	// test DI
	expect(new (await getCookieConstructor())()).toBeInstanceOf(Cookie);
});

describe("Cookie", () => {
	beforeAll(async () => {
		// mock CookieConf to return sample data
		// @ts-ignore: dynamically added method for test
		Conf.prototype.get.mockReturnValue(["TEST_COOKIE1=0"]);
	});
	beforeEach(() => {
		// モック関数の呼び出し履歴をリセット
		jest.clearAllMocks();
	});
	describe("Constructor", () => {
		test("load Conf to create instance", async () => {
			const CC = await getCookieConstructor();
			const cookie = await CC.createLoadedInstance();
			expect(Conf).toBeCalledTimes(1);
			expect(cookie).toBeInstanceOf(Cookie);
		});
		describe("convertSetCookies2CookieArray", () => {
			let CC!: typeof Cookie;
			beforeAll(async () => {
				CC = await getCookieConstructor();
			});
			test("multiple cookies", async () => {
				expect(CC.convertSetCookies2CookieArray([
					"TEST_COOKIE1=1; Path=/; HttpOnly",
					"TEST_COOKIE2=abc; Max-Age=86400; HttpOnly"
				])).toEqual(["TEST_COOKIE1=1", "TEST_COOKIE2=abc"]);
			});
			test("empty", async () => {
				expect(CC.convertSetCookies2CookieArray([])).toEqual([]);
			});
		})
	});
	describe("instance", () => {
		describe("get/set", () => {
			test("init", async () => {
				expect((new (await getCookieConstructor())).get()).toEqual([]);
			});
			test("loaded", async () => {
				const cookie = await (await getCookieConstructor()).createLoadedInstance();
				expect(cookie.get()).toEqual(["TEST_COOKIE1=0"]);
			});
			test("set value", async () => {
				const cookie = await (await getCookieConstructor()).createLoadedInstance();
				cookie.set(["TEST_COOKIE1=10", "TEST_COOKIE2=abcd"]);
				expect(cookie.get()).toEqual(["TEST_COOKIE1=10", "TEST_COOKIE2=abcd"]);
			});
		});
		test("empty", async () => {
			const cookie = new (await getCookieConstructor());
			cookie.set(["x=y"]);
			expect(cookie.get()).toEqual(["x=y"]);
			cookie.empty();
			expect(cookie.get()).toEqual([]);
		});
		test("clone", async () => {
			const cookie = new (await getCookieConstructor());
			cookie.set(["foo=1", "bar=2"]);
			const cookie2 = cookie.clone();
			cookie.set(["foo=3", "bar=5"]);
			expect(cookie.get()).toEqual(["foo=3", "bar=5"]);
			expect(cookie2.get()).toEqual(["foo=1", "bar=2"]);
		});
		test("loadConfigFile", async () => {
			const cookie = new (await getCookieConstructor());
			expect(cookie.get()).toEqual([]);
			expect(Conf.prototype.get).toBeCalledTimes(0);
			await cookie.loadConfigFile();
			expect(cookie.get()).toEqual(["TEST_COOKIE1=0"]);
			expect(Conf.prototype.get).toBeCalledTimes(1);
			expect(Conf.prototype.get).toBeCalledWith("cookies");
		});
		test("saveConfigFile", async () => {
			const cookie = new (await getCookieConstructor());
			cookie.set(["foo=abc", "bar=xyz"]);
			expect(Conf.prototype.set).toBeCalledTimes(0);
			await cookie.saveConfigFile();
			expect(Conf.prototype.set).toBeCalledTimes(1);
			expect(Conf.prototype.set).toBeCalledWith("cookies", ["foo=abc", "bar=xyz"]);
		})
	});
});
