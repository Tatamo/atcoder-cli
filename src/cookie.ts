// yummy!
import Conf from "conf";

/**
 * Cookie管理用クラス
 * cookieはHTTPリクエストヘッダにおける Cookie: a=b; c=d
 * の"a=b", "c=d"の部分を文字列の配列として管理する
 */
export class Cookie {
	private cookies: Array<string>;
	private static _cookie_conf: Conf | null = null;

	protected static getCookieConfig(): Conf {
		if (Cookie._cookie_conf !== null) return Cookie._cookie_conf;
		return Cookie._cookie_conf = new Conf({defaults: {cookies: []}, configName: "session"});
	}

	/**
	 * @param load_from_config default=false trueなら設定ファイルからcookieを読み込む
	 */
	constructor(load_from_config: boolean = true) {
		this.cookies = [];
		if (load_from_config) this.loadConfigFile();
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
	loadConfigFile(): void {
		this.cookies = Cookie.getCookieConfig().get("cookies");
	}

	/**
	 * 現在保持しているcookieを設定ファイルに書き出す
	 */
	saveConfigFile(): void {
		Cookie.getCookieConfig().set("cookies", this.cookies);
	}
}