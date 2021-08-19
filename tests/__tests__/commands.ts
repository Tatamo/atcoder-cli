import { login, logout, session, contest } from "../../src/commands";
import { AtCoder } from "../../src/atcoder";
import { getAtCoder } from "../../src/di";
import { Contest, ContestProject, findProjectJSON, Task } from "../../src/project"
jest.mock("../../src/di");
jest.mock("../../src/project")

const dummy_contest: Contest = {
    id: "aic987",
    title: "AtCoder Imaginary Contest 987",
    url: AtCoder.getContestURL("aic987")
};

const dummy_task01: Task = {
    id: "aic987_a",
    label: "A",
    title: "This is Problem",
    url: AtCoder.getTaskURL("aic987", "aic987_a")
};

const dummy_task02: Task = {
    id: "aic987_b",
    label: "B",
    title: "Next Problem",
    url: AtCoder.getTaskURL("aic987", "aic987_b")
};

const dummy_task03: Task = {
    id: "aic987_c",
    label: "C",
    title: "The Test Cases",
    url: AtCoder.getTaskURL("aic987", "aic987_c")
};

const dummy_task04: Task = {
    id: "aic987_d",
    label: "D",
    title: "Imaginary Problem",
    url: AtCoder.getTaskURL("aic987", "aic987_d")
};

const dummy_contest_project: ContestProject = {
    contest: dummy_contest,
    tasks: [dummy_task01, dummy_task02, dummy_task03, dummy_task04]
};

describe("Commands", () => {
    let atcoder: AtCoder;
    let log = "";
    let elog = "";
    beforeAll(async () => {
        jest.spyOn(console, "log").mockImplementation(s => log += `${s}\n`);
        jest.spyOn(console, "error").mockImplementation(s => elog += `${s}\n`);
        atcoder = jest.genMockFromModule<{ AtCoder: AtCoder }>("../../src/atcoder").AtCoder;
        // @ts-ignore: dynamically added method for test
        getAtCoder.mockResolvedValue(atcoder);
    });
    beforeEach(() => {
        // clear call histories of mock functions
        jest.clearAllMocks();
        log = "";
        elog = "";
    });
    describe("login()", () => {
        test("login success", async () => {
            atcoder.login = jest.fn(async () => true);

            await login();
            expect(log).toMatchSnapshot();
            expect(atcoder.login).toBeCalledTimes(1);
        })
        test("login fail", async () => {
            atcoder.login = jest.fn(async () => false);

            await login();
            expect(log).toMatchSnapshot();
            expect(atcoder.login).toBeCalledTimes(1);
        })
    });
    describe("logout()", () => {
        test("logout", async () => {
            atcoder.logout = jest.fn();

            await logout();
            expect(log).toMatchSnapshot();
            expect(atcoder.logout).toBeCalledTimes(1);
        })
    });
    describe("session()", () => {
        test("logged-in", async () => {
            atcoder.checkSession = jest.fn(async () => true);

            await session();
            expect(log).toMatchSnapshot();
            expect(elog).toMatchSnapshot();
            expect(atcoder.checkSession).toBeCalledTimes(1);
        })
        test("not logged-in", async () => {
            atcoder.checkSession = jest.fn(async () => false);

            await session();
            expect(log).toMatchSnapshot();
            expect(elog).toMatchSnapshot();
            expect(atcoder.checkSession).toBeCalledTimes(1);
        })
    });
    describe("contest()", () => {
        describe("contest id is not given", () => {
            test("find project json found, without id", async () => {
                // @ts-ignore: dynamically added method for test
                findProjectJSON.mockResolvedValueOnce({ path: "/dummy/path", data: dummy_contest_project });
                await contest(undefined, {});
                expect(log).toMatchSnapshot();
                expect(elog).toMatchSnapshot();
                expect(findProjectJSON).toBeCalledTimes(1);
            })
            test("find project json found, with id", async () => {
                // @ts-ignore: dynamically added method for test
                findProjectJSON.mockResolvedValueOnce({ path: "/dummy/path", data: dummy_contest_project });
                await contest(undefined, { id: true });
                expect(log).toMatchSnapshot();
                expect(elog).toMatchSnapshot();
                expect(findProjectJSON).toBeCalledTimes(1);
            })
            test("project json not found", async () => {
                // @ts-ignore: dynamically added method for test
                findProjectJSON.mockRejectedValueOnce(new Error("contest.acc.json not found."));
                await contest(undefined, {});
                expect(log).toMatchSnapshot();
                expect(elog).toMatchSnapshot();
                expect(findProjectJSON).toBeCalledTimes(1);
            });
        });
        describe("contest id is given", () => {
            test("contest found, without id", async () => {
                atcoder.checkSession = jest.fn(async () => true);
                atcoder.contest = jest.fn(async _ => dummy_contest);
                await contest("aic987", {});
                expect(log).toMatchSnapshot();
                expect(elog).toMatchSnapshot();
                expect(findProjectJSON).toBeCalledTimes(0);
                expect(atcoder.contest).toBeCalledTimes(1);
                expect(atcoder.contest).toBeCalledWith("aic987");
            });
            test("contest found, with id", async () => {
                atcoder.checkSession = jest.fn(async () => true);
                atcoder.contest = jest.fn(async _ => dummy_contest);
                await contest("aic987", { id: true });
                expect(log).toMatchSnapshot();
                expect(elog).toMatchSnapshot();
                expect(findProjectJSON).toBeCalledTimes(0);
                expect(atcoder.contest).toBeCalledTimes(1);
                expect(atcoder.contest).toBeCalledWith("aic987");
            });
            test("contest not found", async () => {
                atcoder.checkSession = jest.fn(async () => true);
                atcoder.contest = jest.fn(async _ => {
                    throw new Error();
                });
                await contest("aic987654321", {});
                expect(log).toMatchSnapshot();
                expect(elog).toMatchSnapshot();
                expect(findProjectJSON).toBeCalledTimes(0);
                expect(atcoder.contest).toBeCalledTimes(1);
                expect(atcoder.contest).toBeCalledWith("aic987654321");
            });
        });
    });
});
