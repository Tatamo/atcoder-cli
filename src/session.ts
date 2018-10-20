import {Cookie} from "./cookie";
import {default as _axios, AxiosRequestConfig, AxiosResponse} from "axios";

// 常にtext/htmlをAcceptヘッダーに加えて通信する
const axios = _axios.create({headers: {Accept: "text/html"}});

/**
 * セッション管理用クラス
 * こいつでcookieを使いまわしてログイン認証した状態でデータをとってくる
 */
export class Session {
	private readonly _cookies: Cookie;
	get cookies(): Cookie {
		return this._cookies;
	}

	constructor() {
		this._cookies = new Cookie();
	}

	async get(url: string, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
		return await axios(url, {
			headers: {
				Cookie: this.cookies.get().join("; ")
			},
			...options
		})
	}

	async post(url: string, data?: any, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
		return await axios.post(url, data, {
			headers: {
				Cookie: this.cookies.get().join("; ")
			},
			...options
		})
	}
}
