import {CookieJar, CoreOptions, Response} from "request";
import request from "request-promise-native"

/**
 * セッション管理用クラス
 * こいつでcookieを使いまわしてログイン認証した状態でデータをとってくる
 */
export class Session {
	private readonly _jar: CookieJar;
	get jar(): CookieJar {
		return this._jar;
	}

	constructor(jar?: CookieJar) {
		if (jar === undefined) {
			this._jar = request.jar();
		}
		else {
			this._jar = jar
		}
	}

	async fetch(uri: string, options: CoreOptions = {}): Promise<Response> {
		// requestの呼び出しによってthis.jarの内部状態が書き換わる
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