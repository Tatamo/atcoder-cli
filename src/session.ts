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
		// UNDONE
		return false;
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
			uri: Session.login_url,
			jar: this.jar,
			followAllRedirects: true,
			method: "POST",
			resolveWithFullResponse: true,
			formData: {
				username,
				password,
				csrf_token
			}
		};
		const response = await request(options);
		// トップページにリダイレクトされていればログイン成功とみなす
		return response.request.uri.href === Session.base_url;
	}

	/**
	 * ログインページにアクセスしてCSRFトークンを取得
	 */
	private async getCSRFToken(): Promise<string> {
		const response = await
			request({
				uri: Session.login_url,
				jar: this.jar,
				resolveWithFullResponse: true
			});

		const {document} = new JSDOM(response.body).window;
		const input: HTMLInputElement = (document.getElementsByName("csrf_token")[0]) as HTMLInputElement;
		return input.value;
	}
}