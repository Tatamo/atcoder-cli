import rq from "request";
import request from "request-promise-native"
import {JSDOM} from "jsdom";
import inquirer from "inquirer";

export class Session {
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
	async login() {
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
			uri: "https://beta.atcoder.jp/login",
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
		return await request(options);
	}

	/**
	 * ログインページにアクセスしてCSRFトークンを取得
	 */
	private async getCSRFToken(): Promise<string> {
		const uri = "https://beta.atcoder.jp/login";
		const response = await
			request({
				uri,
				jar: this.jar,
				resolveWithFullResponse: true
			});

		const {document} = new JSDOM(response.body).window;
		const input: HTMLInputElement = (document.getElementsByName("csrf_token")[0]) as HTMLInputElement;
		return input.value;
	}
}