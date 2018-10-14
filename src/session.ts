import rq from "request";
import request from "request-promise-native"
import {JSDOM} from "jsdom";
import inquirer from "inquirer";
import {ATCODER_BASE_URL, ATCODER_LOGIN_PATH} from "./definitions";

export class Session {
	static get base_url(): string {
		return ATCODER_BASE_URL;
	}

	static get login_url(): string {
		return `${Session.base_url}${ATCODER_LOGIN_PATH}`;
	}

	private _jar: rq.CookieJar;
	get jar(): rq.CookieJar {
		return this._jar;
	}

	constructor(jar?: rq.CookieJar) {
		if (jar === undefined) {
			this._jar = request.jar();
		}
		else {
			this._jar = jar
		}
	}

	/**
	 * ログインしている状態かどうかを取得する
	 */
	async check(): Promise<boolean> {
		// practice contestでログインせず提出ページにアクセスするとコンテストトップに飛ばされることを利用する
		const uri = `${Session.base_url}contests/practice/submit`;
		const response = await this.fetch(uri);

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
		const response = await this.fetch(Session.login_url, options);
		// トップページにリダイレクトされていればログイン成功とみなす
		return response.request.uri.href === Session.base_url;
	}

	/**
	 * ログインページにアクセスしてCSRFトークンを取得
	 */
	private async getCSRFToken(): Promise<string> {
		const response = await this.fetch(Session.login_url);

		const {document} = new JSDOM(response.body).window;
		const input: HTMLInputElement = (document.getElementsByName("csrf_token")[0]) as HTMLInputElement;
		return input.value;
	}

	async fetch(uri: string, options: rq.CoreOptions = {}): Promise<rq.Response> {
		return await
			request({
				uri,
				jar: this.jar,
				followAllRedirects: true,
				resolveWithFullResponse: true,
				...options
			});
	}
}