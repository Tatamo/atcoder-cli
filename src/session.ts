import {CookieConstructorInterface, CookieInterface} from "./cookie";

type AxiosRequestConfig = import("axios").AxiosRequestConfig;
type AxiosResponse = import("axios").AxiosResponse;

export interface SessionInterface {
	get(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse>;
	post(url: string, data?: any, options?: AxiosRequestConfig): Promise<AxiosResponse>;
	saveSessionFromCookies(cookies: Array<string>): Promise<void>;
	/**
	 * 現在のセッション情報を破棄します
	 */
	removeSession(): Promise<void>;
}

/**
 * セッション管理用クラス
 * こいつでcookieを使いまわしてログイン認証した状態でデータをとってくる
 */
export class Session implements SessionInterface {
	private static _axios: import("axios").AxiosInstance | null = null;
	private CookieConstructor: CookieConstructorInterface
	private _cookies: CookieInterface | null;

	constructor(CookieConstructor: CookieConstructorInterface) {
		this.CookieConstructor = CookieConstructor
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

	async getCookies(): Promise<CookieInterface> {
		if (this._cookies === null) {
			return this._cookies = await this.CookieConstructor.createLoadedInstance();
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

	async saveSessionFromCookies(cookies: Array<string>): Promise<void> {
		const session_cookies = await this.getCookies();
		session_cookies.set(cookies);
		await session_cookies.saveConfigFile();
	}

	async removeSession(): Promise<void> {
		const session_cooies = (await this.getCookies());
		session_cooies.empty();
		await session_cooies.saveConfigFile();
	}
}
