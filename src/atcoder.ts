import {Session} from "./session";

export class AtCoder {
	private session: Session;
	// null:未検査 true/false: ログインしているかどうか
	private _login: boolean | null;

	constructor() {
		this.session = new Session();
		this._login = null;
	}

	/**
	 * ログインしているか調べる
	 * @param force default=false trueならキャッシュを使わずちゃんと調べる
	 */
	async checkSession(force: boolean = false): Promise<boolean> {
		// 以前取得済みならいちいち接続して確かめない
		if (this._login !== null && !force) return this._login;
		return this._login = await this.session.check();
	}

	async login() {
		return await this.session.login();
	}
}