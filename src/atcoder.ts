import {Session} from "./session";
import {Cookie} from "./cookie";
import querystring from "query-string";
import {Contest, Task} from "./definitions";

const ATCODER_BASE_URL = "https://beta.atcoder.jp/";

export class AtCoder {
	static get base_url(): string {
		return ATCODER_BASE_URL;
	}

	static get login_url(): string {
		return `${AtCoder.base_url}login`;
	}

	static getContestURL(contest: string) {
		return `${AtCoder.base_url}contests/${contest}`;
	}

	static getTaskURL(contest: string, task?: string) {
		return `${AtCoder.getContestURL(contest)}/tasks${task === undefined ? "" : `/${task}`}`;
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
		const url = `${AtCoder.getContestURL("practice")}/submit`;
		// リダイレクトを無効化・302コードを容認して通信
		const response = await this.session.get(url, {
			maxRedirects: 0,
			validateStatus: (status) => (status >= 200 && status < 300) || status === 302
		});
		// リダイレクトされなければログインしている
		return response.status !== 302;
	}

	/**
	 * ログイン処理します
	 * あまりパスワード文字列を引き回したくないので、この中で標準入力からユーザー名とパスワードを尋ねる
	 */
	async login(): Promise<boolean> {
		if (await this.checkSession()) {
			console.error("you logged-in already");
			return true;
		}
		const {csrf_token, cookies} = await this.getCSRFToken();

		// ユーザーネームとパスワードを入力させる
		const inquirer = await import("inquirer");
		const {username, password} = await inquirer.prompt([{
			type: "input",
			message: "username:",
			name: "username"
		}, {
			type: "password",
			message: "password:",
			name: "password"
		}]) as { username: string, password: string };

		const response = await this.session.post(
			AtCoder.login_url,
			querystring.stringify({username, password, csrf_token}),
			{
				maxRedirects: 0,
				validateStatus: (status) => (status >= 200 && status < 300) || status === 302,
				headers: {
					Cookie: cookies.join("; ")
				}
			}
		).catch(e => e);


		// ログインページ以外にリダイレクトされていればログイン成功とみなす
		const result = response.headers.location !== "/login";
		if (result) {
			// ログインに成功していた場合はセッション情報を保存する
			const new_cookies = Cookie.convertSetCookies2CookieArray(response.headers["set-cookie"]);
			const session_cookies = await this.session.getCookies();
			session_cookies.set(new_cookies);
			session_cookies.saveConfigFile();
		}
		return result;
	}

	/**
	 * ログインページにアクセスしてCSRFトークンを取得
	 */
	private async getCSRFToken(): Promise<{ csrf_token: string, cookies: Array<string> }> {
		const {JSDOM} = await import("jsdom");
		// cookieなしでログインページにアクセス
		const response = await this.session.get(AtCoder.login_url, {headers: {Cookie: ""}});

		const {document} = new JSDOM(response.data).window;
		const input: HTMLInputElement = (document.getElementsByName("csrf_token")[0]) as HTMLInputElement;
		return {csrf_token: input.value, cookies: Cookie.convertSetCookies2CookieArray(response.headers["set-cookie"])};
	}

	/**
	 * コンテストIDからコンテストの情報を取得
	 * @param id
	 * @throws Error
	 */
	async contest(id: string): Promise<Contest> {
		const url = AtCoder.getContestURL(id);
		// コンテストが見つからない場合エラーとなるがハンドルせず外に投げる
		const response = await this.session.get(url);
		const {JSDOM} = await import("jsdom");
		const {document} = new JSDOM(response.data).window;
		const regexp = /^(.*) - AtCoder$/;
		const title = regexp.test(document.title) ? regexp.exec(document.title)![1] : document.title;
		return {id, title, url};
	}

	/**
	 * 問題一覧を取得
	 * @param contest_id
	 * @throws Error
	 */
	async tasks(contest_id: string): Promise<Array<Task>> {
		// コンテストが見つからない場合エラーとなるがハンドルせず外に投げる
		const response = await this.session.get(AtCoder.getTaskURL(contest_id));

		const {JSDOM} = await import("jsdom");
		const {document} = new JSDOM(response.data).window;
		// very very ad-hoc and not type-safe section
		const tbody = document.querySelector("#main-div .row table>tbody");
		if (tbody === null) return [];
		const tasks: Array<Task> = [];
		for (const tr of tbody.querySelectorAll("tr")) {
			// tr>td>a
			const id: string = tr.children[0].children[0].getAttribute("href")!.split("/").pop()!;
			const label: string = (tr.children[0].children[0] as HTMLAnchorElement).text;
			const title: string = (tr.children[1].children[0] as HTMLAnchorElement).text;
			const url: string = `${AtCoder.base_url}${tr.children[0].children[0].getAttribute("href")!.substring(1)}`;
			tasks.push({id, label, title, url});
		}
		return tasks;
	}

	/**
	 * 単一の問題を取得
	 * @param contest_id
	 * @param task_id
	 * @throws Error
	 */
	async task(contest_id: string, task_id: string): Promise<Task> {
		const tasks = await this.tasks(contest_id);
		for (const task of tasks) {
			if (task.id === task_id) return task;
		}
		throw new Error(`Task ${task_id} not found.`);
	}
}
