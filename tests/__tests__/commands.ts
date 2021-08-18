import { login, logout, session } from "../../src/commands";
import { AtCoder } from "../../src/atcoder";
import { getAtCoder } from "../../src/di";
jest.mock("../../src/di");

describe("Commands", () => {
    let atcoder: AtCoder;
    beforeAll(async () => {
        atcoder = jest.genMockFromModule<{ AtCoder: AtCoder }>("../../src/atcoder").AtCoder;
        // @ts-ignore: dynamically added method for test
        getAtCoder.mockResolvedValue(atcoder);
    });
    beforeEach(() => {
        // clear call histories of mock functions
        jest.clearAllMocks();
    });
    describe("login()", () => {
        test("login success", async () => {
            let log = "";
            const spy_console_log = jest.spyOn(console, "log").mockImplementation(s => log += `${s}\n`);
            atcoder.login = jest.fn(async () => true);

            await login();
            expect(log).toMatchSnapshot();
            expect(atcoder.login).toBeCalledTimes(1);
            spy_console_log.mockRestore();
        })
        test("login fail", async () => {
            let log = "";
            const spy_console_log = jest.spyOn(console, "log").mockImplementation(s => log += `${s}\n`);
            atcoder.login = jest.fn(async () => false);

            await login();
            expect(log).toMatchSnapshot();
            expect(atcoder.login).toBeCalledTimes(1);
            spy_console_log.mockRestore();
        })
    });
    describe("logout()", () => {
        test("logout", async () => {
            let log = "";
            const spy_console_log = jest.spyOn(console, "log").mockImplementation(s => log += `${s}\n`);
            atcoder.logout = jest.fn();

            await logout();
            expect(log).toMatchSnapshot();
            expect(atcoder.logout).toBeCalledTimes(1);
            spy_console_log.mockRestore();
        })
    });
    describe("session()", () => {
        test("logged-in", async () => {
            let log = "";
            const spy_console_log = jest.spyOn(console, "log").mockImplementation(s => log += `${s}\n`);
            atcoder.checkSession = jest.fn(async () => true);

            await session();
            expect(log).toMatchSnapshot();
            expect(atcoder.checkSession).toBeCalledTimes(1);
            spy_console_log.mockRestore();
        })
        test("not logged-in", async () => {
            let log = "";
            const spy_console_log = jest.spyOn(console, "log").mockImplementation(s => log += `${s}\n`);
            atcoder.checkSession = jest.fn(async () => false);

            await session();
            expect(log).toMatchSnapshot();
            expect(atcoder.checkSession).toBeCalledTimes(1);
            spy_console_log.mockRestore();
        })
    });
});
