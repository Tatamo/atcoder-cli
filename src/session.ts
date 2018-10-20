import {Cookie} from "./cookie";

type AxiosRequestConfig = import("axios").AxiosRequestConfig;
type AxiosResponse = import("axios").AxiosResponse;

/**
 * セッション管理用クラス
 * こいつでcookieを使いまわしてログイン認証した状態でデータをとってくる
 */
export class Session {
	private static _axios: import("axios").AxiosInstance | null = null;
	private _cookies: Cookie | null;

	constructor() {
		this._cookies = null;
	}

	// 必要になった瞬間にaxiosをimportする
	static async importAxios(): Promise<import("axios").AxiosInstance> {
		if (Session._axios === null) {
			const _axios = (await import("axios")).default;
			// 常にtext/htmlをAcceptヘッダーに加えて通信する
			return Session._axios = _axios.create({headers: {Accept: "text/html"}});
		}
		return Session._axios;
	}

	async getCookies(): Promise<Cookie> {
		if (this._cookies === null) {
			return this._cookies = await Cookie.createLoadedInstance();
		}
		return this._cookies;
	}

	async get(url: string, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
		return await (await Session.importAxios())(url, {
			headers: {
				Cookie: (await this.getCookies()).get().join("; ")
			},
			...options
		})
	}

	async post(url: string, data?: any, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
		return await (await Session.importAxios()).post(url, data, {
			headers: {
				Cookie: (await this.getCookies()).get().join("; ")
			},
			...options
		})
	}
}