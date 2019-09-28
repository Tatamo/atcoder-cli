import {name as projectName} from "../package.json";
// yummy!
type CookieConf = import("conf")<Array<string>>;

export interface CookieInterface {
	/**
	 * 現在保持しているcookieを取得
	 */
	get(): Array<string>;
	/**
	 * 現在保持しているcookieを新しいものに置き換える
	 * @param cookies 新しく保持するcookie全体を表す、"key=value"形式の文字列の配列
	 */
	set(cookies: Array<string>): void;
	/**
	 * 現在保持しているcookieを捨てる
	 */
	empty(): void;
	/**
	 * 設定ファイルからcookieを読み込んで保持する
	 */
	loadConfigFile(): Promise<void>;
	/**
	 * 現在保持しているcookieを設定ファイルに書き出す
	 */
	saveConfigFile(): Promise<void>;
}

export interface CookieConstructorInterface {
	/**
	 * 設定ファイルからcookie情報を読み込み済みのインスタンスを生成
	 */
	createLoadedInstance(): Promise<Cookie>
}

/**
 * Cookie管理用クラス
 * cookieはHTTPリクエストヘッダにおける Cookie: a=b; c=d
 * の"a=b", "c=d"の部分を文字列の配列として管理する
 */
export class Cookie implements CookieInterface {
	private cookies: Array<string>;
	private static _cookie_conf: CookieConf | null = null;

	protected static async getCookieConfig(): Promise<CookieConf> {
		if (Cookie._cookie_conf !== null) return Cookie._cookie_conf;
		const Conf = (await import("conf")).default;
		return Cookie._cookie_conf = new Conf({defaults: {cookies: []}, configName: "session", projectName});
	}

	/**
	 * 設定ファイルからcookie情報を読み込み済みのインスタンスを生成
	 */
	static async createLoadedInstance(): Promise<Cookie> {
		const cookie = new Cookie();
		await cookie.loadConfigFile();
		return cookie;
	}

	constructor() {
		this.cookies = [];
	}

	/**
	 * 現在保持しているcookieを取得
	 */
	get(): Array<string> {
		return this.cookies;
	}

	/**
	 * 現在保持しているcookieを新しいものに置き換える
	 * @param cookies 新しく保持するcookie全体を表す、"key=value"形式の文字列の配列
	 */
	set(cookies: Array<string>) {
		this.cookies = cookies;
	}

	/**
	 * Set-Cookieヘッダの配列からこのクラスで管理可能な形式のcookie配列に変換
	 * @param cookies
	 */
	static convertSetCookies2CookieArray(cookies: Array<string>): Array<string> {
		return cookies.map(cookie => /^\s*(?:Set-Cookie:\s*)?(.*)$/i.exec(cookie)![1].trim().split(";")[0])
	}

	/**
	 * 現在保持しているcookieを捨てる
	 */
	empty(): void {
		this.cookies = [];
	}

	/**
	 * 設定ファイルからcookieを読み込んで保持する
	 */
	async loadConfigFile(): Promise<void> {
		this.cookies = (await Cookie.getCookieConfig()).get("cookies");
	}

	/**
	 * 現在保持しているcookieを設定ファイルに書き出す
	 */
	async saveConfigFile(): Promise<void> {
		(await Cookie.getCookieConfig()).set("cookies", this.cookies);
	}
}
