import { login } from "../../src/commands";
import { AtCoder } from "../../src/atcoder";
import { getAtCoder } from "../../src/di";
jest.mock("../../src/di");

describe("login()", () => {
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
            spy_console_log.mockRestore();
        })
        test("login fail", async () => {
            let log = "";
            const spy_console_log = jest.spyOn(console, "log").mockImplementation(s => log += `${s}\n`);
            atcoder.login = jest.fn(async () => false);

            await login();
            expect(log).toMatchSnapshot();
            spy_console_log.mockRestore();
        })
    });
});
