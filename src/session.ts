import {CookieConstructorInterface, CookieInterface} from "./cookie";

type AxiosRequestConfig = import("axios").AxiosRequestConfig;
type AxiosResponse = import("axios").AxiosResponse;

export interface SessionInterface {
	/**
	 * このセッションを用いてGETリクエストを発行しする。
	 * @param url リクエスト先のURL
	 * @param options 
	 */
	get(url: string, options?: AxiosRequestConfig): Promise<SessionResponseInterface>;
	/**
	 * このセッションを用いてGETリクエストを発行しする。
	 * @param url リクエスト先のURL
	 * @param data リクエストボディに含めるデータ。 
	 * @param options 
	 */
	post(url: string, data?: any, options?: AxiosRequestConfig): Promise<SessionResponseInterface>;
	/**
	 * トランザクションを実行する。
	 * コールバック中に保存されたセッションはトランザクションが成功して終了するまで保存されない。
	 */
	transaction<R>(callback: () => Promise<R>): Promise<R>
}

export interface SessionResponseInterface {
	/**
	 * レスポンスのHTTPステータスコード。
	 */
	 status: number;
	 /**
	  * レスポンス本文。
	  */
	 data: string;
	/**
	 * HTTPヘッダー
	 */
	 headers: {
		location?: string
	 }
	 /**
	  * このレスポンスの情報を用いてセッションを保存
	  */
	 saveSession(): Promise<void>
}

interface Transaction {
	cookies: CookieInterface;
	/**
	 * cookieをセーブする必要があるか
	 */
	isUpdated: boolean;
}

/**
 * セッション管理用クラス
 * こいつでcookieを使いまわしてログイン認証した状態でデータをとってくる
 */
export class Session implements SessionInterface {
	private static _axios: import("axios").AxiosInstance | null = null;
	private CookieConstructor: CookieConstructorInterface
	private _cookies: CookieInterface | null;
	private _currentTransaction: Transaction | null = null;

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
		if (this._currentTransaction !== null) {
			// if this is inside a transaction, use the temporal cookie.
			return this._currentTransaction.cookies;
		}
		if (this._cookies === null) {
			return this._cookies = await this.CookieConstructor.createLoadedInstance();
		}
		return this._cookies;
	}

	async get(url: string, options: AxiosRequestConfig = {}): Promise<SessionResponseInterface> {
		return this.makeSessionResponse(await (await Session.importAxios())(url, {
			headers: {
				Cookie: (await this.getCookies()).get().join("; ")
			},
			...options
		}))
	}

	async post(url: string, data?: any, options: AxiosRequestConfig = {}): Promise<SessionResponseInterface> {
		return this.makeSessionResponse(await (await Session.importAxios()).post(url, data, {
			headers: {
				Cookie: (await this.getCookies()).get().join("; ")
			},
			...options
		}))
	}

	async transaction<R>(callback: () => Promise<R>): Promise<R> {
		if (this._currentTransaction !== null) {
			throw new Error("Cannot start a new transaction inside transaction.")
		}
		const currentCookies = await this.getCookies();
		this._currentTransaction = {
			cookies: currentCookies.clone(),
			isUpdated: false
		}
		try {
			const result = await callback();
			// If transaction finished successfully, adopt temporal cookie as the new persistent one.
			this._cookies = this._currentTransaction.cookies;
			if (this._currentTransaction.isUpdated) {
				await this._cookies.saveConfigFile();
			}
			return result;
		} finally {
			this._currentTransaction = null;
		}
	}

	private makeSessionResponse({status, data, headers}: AxiosResponse): SessionResponseInterface {
		const saveSession = async ()=>{
			const new_cookies = this.CookieConstructor.convertSetCookies2CookieArray(headers["set-cookie"]);
			await this.saveSessionFromCookies(new_cookies);
		}
		return {
			status,
			data,
			headers,
			saveSession
		}
	}

	private async saveSessionFromCookies(cookies: Array<string>): Promise<void> {
		const session_cookies = await this.getCookies();
		session_cookies.set(cookies);
		if (this._currentTransaction !== null) {
			// If this is inside a transaction, do not save cookie to config file.
			this._currentTransaction.isUpdated = true;
			return;
		}
		await session_cookies.saveConfigFile();
	}
}
