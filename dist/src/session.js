"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
/**
 * セッション管理用クラス
 * こいつでcookieを使いまわしてログイン認証した状態でデータをとってくる
 */
class Session {
    get jar() {
        return this._jar;
    }
    constructor(jar) {
        if (jar === undefined) {
            this._jar = request_promise_native_1.default.jar();
        }
        else {
            this._jar = jar;
        }
    }
    async fetch(uri, options = {}) {
        // requestの呼び出しによってthis.jarの内部状態が書き換わる
        return await request_promise_native_1.default(Object.assign({ uri, jar: this.jar, followAllRedirects: true, resolveWithFullResponse: true }, options));
    }
}
exports.Session = Session;
