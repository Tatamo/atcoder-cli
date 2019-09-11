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
	beforeEach(()=>{
		// jest.resetModules()でcommandsも毎回別物になるので、jest.mockで毎回mockしなおす
		// そのためjest.clearAllMocks()は呼ばなくてもよい
		jest.mock("../../src/commands");
	});
	afterEach(() => {
		// cli/indexは一度しか呼べないため、テストのたびにリセットする
		jest.resetModules();
	});
	describe("acc new", () => {
		test("new <contest-id>", () => {
			const commands = require("../../src/commands");
			run("new", "abc100");
			expect(commands.setup).toBeCalledWith("abc100", expect.anything());
		});
		test("new <contest-id> (2)", () => {
			const commands = require("../../src/commands");
			run("new", "abc101");
			expect(commands.setup).toBeCalledWith("abc101", expect.anything());
			expect(commands.setup).not.toBeCalledWith("abc100", expect.anything());
		});
	});
	describe("acc tasks", () => {
		test("tasks [contest-id]", ()=> {
			const commands = require("../../src/commands");
			run("tasks", "abc101");
			expect(commands.tasks).toBeCalledWith("abc101", expect.not.objectContaining({id: true}));
		});
		test("tasks -i [contest-id]", ()=> {
			const commands = require("../../src/commands");
			run("tasks", "-i", "abc101");
			expect(commands.tasks).toBeCalledWith("abc101", expect.objectContaining({id: true}));
		});
	});
});
