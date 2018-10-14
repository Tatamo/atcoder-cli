import {Session} from "./session";
import inquirer from "inquirer";
import {JSDOM} from "jsdom";
import {ATCODER_BASE_URL, ATCODER_LOGIN_PATH} from "./definitions";

export interface Task {
	title: string,
	label: string,
	path: string
}

export class AtCoder {
	static get base_url(): string {
		return ATCODER_BASE_URL;
	}

	static get login_url(): string {
		return `${AtCoder.base_url}${ATCODER_LOGIN_PATH}`;
	}

	static getContestURL(contest: string) {
		return `${AtCoder.base_url}contests/${contest}`;
	}

	static getTaskURL(contest: string, task: string) {
		return `${AtCoder.getContestURL(contest)}/tasks/${task}`;
	}

	private session: Session;
	// null:未検査 true/false: ログインしているかどうか
	private _login: boolean | null;

	constructor() {
		this.session = new Session();
		this._login = null;
	}

	/**
	 * ログインしているか調べる
	 * @param force default=false trueならキャッシュを使わずちゃんと調べる
	 */
	async checkSession(force: boolean = false): Promise<boolean> {
		// 以前取得済みならいちいち接続して確かめない
		if (this._login !== null && !force) return this._login;
		return this._login = await this.check();
	}

	/**
	 * アクセスしてログインしている状態かどうかを取得する(結果をキャッシュしない)
	 */
	private async check(): Promise<boolean> {
		// practice contestでログインせず提出ページにアクセスするとコンテストトップに飛ばされることを利用する
		const uri = `${AtCoder.base_url}contests/practice/submit`;
		const response = await this.session.fetch(uri);

		// console.log(response.request.uri.href);
		// リダイレクトされなければログインしている
		return response.request.uri.href === uri;
	}

	/**
	 * ログイン処理します
	 * あまりパスワード文字列を引き回したくないので、この中で標準入力からユーザー名とパスワードを尋ねる
	 */
	async login(): Promise<boolean> {
		const csrf_token = await this.getCSRFToken();

		// ユーザーネームとパスワードを入力させる
		const {username, password} = await inquirer.prompt([{
			type: "input",
			message: "username:",
			name: "username"
		}, {
			type: "password",
			message: "password:",
			name: "password"
		}]) as { username: string, password: string };

		const options = {
			method: "POST",
			formData: {
				username,
				password,
				csrf_token
			}
		};
		const response = await this.session.fetch(AtCoder.login_url, options);
		// トップページにリダイレクトされていればログイン成功とみなす
		return response.request.uri.href === AtCoder.base_url;
	}

	/**
	 * ログインページにアクセスしてCSRFトークンを取得
	 */
	private async getCSRFToken(): Promise<string> {
		const response = await this.session.fetch(AtCoder.login_url);

		const {document} = new JSDOM(response.body).window;
		const input: HTMLInputElement = (document.getElementsByName("csrf_token")[0]) as HTMLInputElement;
		return input.value;
	}

	async tasks(contest: string): Promise<Array<Task>> {
		const response = await this.session.fetch(`${AtCoder.getContestURL(contest)}/tasks`);

		const {document} = new JSDOM(response.body).window;
		// very very ad-hoc and not type-safe section
		const tbody = document.querySelector("#main-div .row table>tbody");
		if (tbody === null) return [];
		const tasks: Array<Task> = [];
		for (const tr of tbody.querySelectorAll("tr")) {
			// tr>td>a
			const path: string = tr.children[0].children[0].getAttribute("href")!.split("/").pop()!;
			const label: string = (tr.children[0].children[0] as HTMLAnchorElement).text;
			const title: string = (tr.children[1].children[0] as HTMLAnchorElement).text;
			tasks.push({path, label, title});
		}
		return tasks;
	}
}