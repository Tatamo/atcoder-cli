import {Session} from "./session";
import {ATCODER_BASE_URL, ATCODER_LOGIN_PATH} from "./definitions";
import getConfig from "./config";
import Conf from "conf";
import request, {CookieJar} from "request";

export interface Task {
	id: string,
	label: string,
	title: string,
	url: string
}

export interface Contest {
	id: string,
	title: string,
	url: string
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

	private readonly config: Conf;
	private session: Session;
	// null:未検査 true/false: ログインしているかどうか
	private _login: boolean | null;

	constructor() {
		this.config = getConfig();
		this.session = new Session(this.loadCookiesFromConfig());
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
		if (await this.checkSession()) {
			console.error("you logged-in already");
			return true;
		}
		const csrf_token = await this.getCSRFToken();

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

		const options = {
			method: "POST",
			formData: {
				username,
				password,
				csrf_token
			}
		};
		const response = await this.session.fetch(AtCoder.login_url, options);
		// ログインページ以外にリダイレクトされていればログイン成功とみなす
		const result = response.request.uri.href !== AtCoder.login_url && response.request.uri.href.indexOf(AtCoder.base_url) === 0;
		if (result) {
			// ログインに成功していた場合はセッション情報を保存する
			this.exportCookiesToConfig(this.session.jar);
		}
		return result;
	}

	/**
	 * ログインページにアクセスしてCSRFトークンを取得
	 */
	private async getCSRFToken(): Promise<string> {
		const {JSDOM} = await import("jsdom");
		const response = await this.session.fetch(AtCoder.login_url);

		const {document} = new JSDOM(response.body).window;
		const input: HTMLInputElement = (document.getElementsByName("csrf_token")[0]) as HTMLInputElement;
		return input.value;
	}

	/**
	 * コンテストIDからコンテストの情報を取得
	 * @param id
	 */
	async contest(id: string): Promise<Contest> {
		const url = AtCoder.getContestURL(id);
		const response = await this.session.fetch(url);
		const {JSDOM} = await import("jsdom");
		const {document} = new JSDOM(response.body).window;
		const regexp = /^(.*) - AtCoder$/;
		const title = regexp.test(document.title) ? regexp.exec(document.title)![1] : document.title;
		return {id, title, url};
	}

	/**
	 * 問題一覧を取得
	 * @param contest
	 */
	async tasks(contest: string): Promise<Array<Task>> {
		const response = await this.session.fetch(`${AtCoder.getContestURL(contest)}/tasks`);

		const {JSDOM} = await import("jsdom");
		const {document} = new JSDOM(response.body).window;
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
	 * Configに保存されたCookie情報を読み込む
	 * 引数として与えられたCookieJarの内部状態を書き換えるので、その場合戻り値を再代入する必要はない
	 * @param jar 省略された場合は新しいCookieJarを作って返す
	 */
	private loadCookiesFromConfig(jar?: CookieJar): CookieJar {
		if (jar === undefined) jar = request.jar();
		// configからクッキー情報を取得
		const cookies: string = this.config.get("cookies");
		if (cookies !== undefined) {
			for (const cookie of cookies.split(";")) {
				jar.setCookie(cookie, AtCoder.base_url);
			}
		}
		return jar;
	}

	private exportCookiesToConfig(jar: CookieJar) {
		const cookies = jar.getCookieString(AtCoder.base_url);
		this.config.set("cookies", cookies);
	}
}