import {Cookie} from "../../src/cookie";

/**
 * Cookieクラスの実装を差し替える
 * コンフィグファイルとの読み書きを行わず、必ず空のセッションが返るようにする
 */
export function disableCookieFileIO() {
	Cookie.prototype.loadConfigFile = jest.fn(async function () {
		// @ts-ignore
		this.cookies = []
	});
	Cookie.prototype.saveConfigFile = jest.fn(async function () {
	});
}
