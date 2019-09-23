const argv_original = process.argv.slice();

/**
 * 受け取った引数をコマンドライン引数として、atcoder-cliのコマンドラインからの呼び出しを再現する
 * @param args accに渡される引数(可変長)
 */
const run = (...args: Array<string>) => {
	process.argv = ["node", "acc", ...args];
	require("../../src/cli/index");
	process.argv = argv_original;
};

// コマンドラインからの呼び出しに対して、想定通りの関数が想定通りの引数で呼ばれていることをテストする
describe("command calls", () => {
	beforeEach(() => {
		// jest.resetModules()でcommandsも毎回別物になるので、jest.mockで毎回mockしなおす
		// そのためjest.clearAllMocks()は呼ばなくてもよい
		jest.mock("../../src/commands");
	});
	afterEach(() => {
		// cli/indexは一度しか呼べないため、テストのたびにリセットする
		jest.resetModules();
	});
	describe("acc new", () => {
		test("new abc100", () => {
			const commands = require("../../src/commands");
			run("new", "abc100");
			expect(commands.setup).toBeCalledWith("abc100", expect.anything());
			expect(commands.setup).not.toBeCalledWith("abc101", expect.anything());
		});
		test("n abc102 -c next -f", () => {
			const commands = require("../../src/commands");
			run("n", "abc102", "-c", "next", "-f");
			expect(commands.setup).toBeCalledWith("abc102", expect.objectContaining({tests: true, force: true, choice: "next"}));
			expect(commands.setup).toBeCalledWith("abc102", expect.not.objectContaining({template: expect.anything()}));
		});
		test("new abc103 --no-tests --no-template", () => {
			const commands = require("../../src/commands");
			run("new", "abc103", "--no-tests", "--no-template");
			expect(commands.setup).toBeCalledWith("abc103", expect.objectContaining({tests: false, template: false}));
			expect(commands.setup).toBeCalledWith("abc103", expect.not.objectContaining({choice: expect.anything()}));
		});
		test("new abc104 -t {TASKLABEL}", () => {
			const commands = require("../../src/commands");
			run("new", "abc104", "-t", "{TASKLABEL}");
			expect(commands.setup).toBeCalledWith("abc104", expect.objectContaining({taskDirnameFormat: "{TASKLABEL}"}));
		});
		// NOTE: not implemented option
		test("new abc105 -d {ContestTitle}", () => {
			const commands = require("../../src/commands");
			run("new", "abc105", "-d", "{ContestTitle}");
			expect(commands.setup).toBeCalledWith("abc105", expect.objectContaining({contestDirnameFormat: "{ContestTitle}"}));
		});
	});
	describe("acc add", () => {
		test("add", () => {
			const commands = require("../../src/commands");
			run("add");
			expect(commands.add).toBeCalledWith(expect.anything());
		});
		test("a -c next -f", () => {
			const commands = require("../../src/commands");
			run("a", "-c", "next", "-f");
			expect(commands.add).toBeCalledWith(expect.objectContaining({tests: true, force: true, choice: "next"}));
			expect(commands.add).toBeCalledWith(expect.not.objectContaining({template: expect.anything()}));
		});
		test("add -t {TASKLABEL}", () => {
			const commands = require("../../src/commands");
			run("a", "-t", "{TASKLABEL}");
			expect(commands.add).toBeCalledWith(expect.objectContaining({taskDirnameFormat: "{TASKLABEL}"}));
		});
		test("add --no-tests --no-template", () => {
			const commands = require("../../src/commands");
			run("add", "--no-tests", "--no-template");
			expect(commands.add).toBeCalledWith(expect.objectContaining({tests: false, template: false}));
			expect(commands.add).toBeCalledWith(expect.not.objectContaining({choice: expect.anything()}));
		});
	});
	describe("acc submit", () => {
		test("submit", () => {
			const commands = require("../../src/commands");
			run("submit");
			expect(commands.submit).toBeCalledWith(undefined, expect.anything());
		});
		test("s main.cpp", () => {
			const commands = require("../../src/commands");
			run("s", "main.cpp");
			expect(commands.submit).toBeCalledWith("main.cpp", expect.anything());
			expect(commands.submit).toBeCalledWith("main.cpp", expect.not.objectContaining({contest: expect.anything(), task: expect.anything()}));
		});
		test("s -c abc100 -t abc100_a", () => {
			const commands = require("../../src/commands");
			run("s", "-c", "abc100", "-t", "abc100_a");
			expect(commands.submit).toBeCalledWith(undefined, expect.objectContaining({contest: "abc100", task: "abc100_a"}));
		});
	});
	describe("acc login", () => {
		test("login", () => {
			const commands = require("../../src/commands");
			run("login");
			expect(commands.login).toBeCalledWith(expect.anything());
		});
	});
	describe("acc logout", () => {
		test("logout", () => {
			const commands = require("../../src/commands");
			run("logout");
			expect(commands.logout).toBeCalledWith(expect.anything());
		});
	});
	describe("acc session", () => {
		test("session", () => {
			const commands = require("../../src/commands");
			run("session");
			expect(commands.session).toBeCalledWith(expect.anything());
		});
	});
	describe("acc contest", () => {
		test("contest", () => {
			const commands = require("../../src/commands");
			run("contest");
			expect(commands.contest).toBeCalledWith(undefined, expect.not.objectContaining({id: true}));
		});
		test("contest abc100", () => {
			const commands = require("../../src/commands");
			run("contest", "abc100");
			expect(commands.contest).toBeCalledWith("abc100", expect.not.objectContaining({id: true}));
		});
		test("contest -i abc101", () => {
			const commands = require("../../src/commands");
			run("contest", "-i", "abc101");
			expect(commands.contest).toBeCalledWith("abc101", expect.objectContaining({id: true}));
		});
	});
	describe("acc task", () => {
		test("task", () => {
			const commands = require("../../src/commands");
			run("task");
			expect(commands.task).toBeCalledWith(undefined, undefined, expect.not.objectContaining({id: true}));
		});
		test("task abc100", () => {
			const commands = require("../../src/commands");
			run("task", "abc100");
			expect(commands.task).toBeCalledWith("abc100", undefined, expect.not.objectContaining({id: true}));
		});
		test("task -i abc101 abc101_b", () => {
			const commands = require("../../src/commands");
			run("task", "-i", "abc101", "abc101_b");
			expect(commands.task).toBeCalledWith("abc101", "abc101_b", expect.objectContaining({id: true}));
		});
	});
	describe("acc tasks", () => {
		test("tasks abc101", () => {
			const commands = require("../../src/commands");
			run("tasks", "abc101");
			expect(commands.tasks).toBeCalledWith("abc101", expect.not.objectContaining({id: true}));
		});
		test("tasks -i abc101", () => {
			const commands = require("../../src/commands");
			run("tasks", "-i", "abc101");
			expect(commands.tasks).toBeCalledWith("abc101", expect.objectContaining({id: true}));
		});
	});
	describe("acc url", () => {
		test("url", () => {
			const commands = require("../../src/commands");
			run("url");
			expect(commands.url).toBeCalledWith(undefined, undefined, expect.not.objectContaining({check: true}));
		});
		test("url abc102", () => {
			const commands = require("../../src/commands");
			run("url", "abc102");
			expect(commands.url).toBeCalledWith("abc102", undefined, expect.not.objectContaining({check: true}));
		});
		test("url -c abc102", () => {
			const commands = require("../../src/commands");
			run("url", "-c", "abc102");
			expect(commands.url).toBeCalledWith("abc102", undefined, expect.objectContaining({check: true}));
		});
		test("url -c abc102 abc102_a", () => {
			const commands = require("../../src/commands");
			run("url", "-c", "abc102", "abc102_a");
			expect(commands.url).toBeCalledWith("abc102", "abc102_a", expect.objectContaining({check: true}));
		});
	});
	describe("acc format", () => {
		test("format \"{ContestID} - {ContestTitle}\" abc110", () => {
			const commands = require("../../src/commands");
			run("format", "{ContestID} - {ContestTitle}", "abc110");
			expect(commands.format).toBeCalledWith("{ContestID} - {ContestTitle}", "abc110", undefined, expect.anything());
		});
		test("format \"{index1} {TaskLabel}: {TaskTitle} ({ContestID})\" abc111 abc111_b", () => {
			const commands = require("../../src/commands");
			run("format", "{index1} {TaskLabel}: {TaskTitle} ({ContestID})", "abc111", "abc111_b");
			expect(commands.format).toBeCalledWith("{index1} {TaskLabel}: {TaskTitle} ({ContestID})", "abc111", "abc111_b", expect.anything());
		});
	});
	describe("acc check-oj", () => {
		test("check-oj", () => {
			const commands = require("../../src/commands");
			run("check-oj");
			expect(commands.checkOJAvailable).toBeCalledWith(expect.anything());
		});
	});
	describe("acc config", () => {
		test("config", () => {
			const commands = require("../../src/commands");
			run("config");
			expect(commands.config).toBeCalledWith(undefined, undefined, expect.not.objectContaining({D: true}));
		});
		test("config default-template", () => {
			const commands = require("../../src/commands");
			run("config", "default-template");
			expect(commands.config).toBeCalledWith("default-template", undefined, expect.not.objectContaining({D: true}));
		});
		// TODO: -d だけでなく --delete も受け付けるようにする
		test("config -d default-template", () => {
			const commands = require("../../src/commands");
			run("config", "-d", "default-template");
			expect(commands.config).toBeCalledWith("default-template", undefined, expect.objectContaining({D: true}));
		});
		test("config default-task-choice next", () => {
			const commands = require("../../src/commands");
			run("config", "default-task-choice", "next");
			expect(commands.config).toBeCalledWith("default-task-choice", "next", expect.not.objectContaining({D: true}));
		});
	});
	describe("acc config-dir", () => {
		test("config-dir", () => {
			const commands = require("../../src/commands");
			run("config-dir");
			expect(commands.configDir).toBeCalledWith(expect.anything());
		});
	});
	describe("acc templates", () => {
		test("templates", () => {
			const commands = require("../../src/commands");
			run("templates");
			expect(commands.getTemplateList).toBeCalledWith(expect.anything());
		});
	});
});
