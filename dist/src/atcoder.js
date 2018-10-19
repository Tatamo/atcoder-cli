"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const session_1 = require("./session");
const inquirer_1 = __importDefault(require("inquirer"));
const jsdom_1 = require("jsdom");
const definitions_1 = require("./definitions");
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const config_1 = __importDefault(require("./config"));
class AtCoder {
    static get base_url() {
        return definitions_1.ATCODER_BASE_URL;
    }
    static get login_url() {
        return `${AtCoder.base_url}${definitions_1.ATCODER_LOGIN_PATH}`;
    }
    static getContestURL(contest) {
        return `${AtCoder.base_url}contests/${contest}`;
    }
    static getTaskURL(contest, task) {
        return `${AtCoder.getContestURL(contest)}/tasks/${task}`;
    }
    constructor() {
        this.config = config_1.default();
        this.session = new session_1.Session(this.loadCookiesFromConfig());
        this._login = null;
    }
    /**
     * ログインしているか調べる
     * @param force default=false trueならキャッシュを使わずちゃんと調べる
     */
    async checkSession(force = false) {
        // 以前取得済みならいちいち接続して確かめない
        if (this._login !== null && !force)
            return this._login;
        return this._login = await this.check();
    }
    /**
     * アクセスしてログインしている状態かどうかを取得する(結果をキャッシュしない)
     */
    async check() {
        // practice contestでログインせず提出ページにアクセスするとコンテストトップに飛ばされることを利用する
        const uri = `${AtCoder.base_url}contests/practice/submit`;
        const response = await this.session.fetch(uri);
        // console.log(response.request.uri.href);
        // リダイレクトされなければログインしている
        return response.request.uri.href === uri;
    }
    /**
     * ログイン処理します
     * あまりパスワード文字列を引き回したくないので、この中で標準入力からユーザー名とパスワードを尋ねる
     */
    async login() {
        if (await this.checkSession()) {
            console.error("you logged-in already");
            return true;
        }
        const csrf_token = await this.getCSRFToken();
        // ユーザーネームとパスワードを入力させる
        const { username, password } = await inquirer_1.default.prompt([{
                type: "input",
                message: "username:",
                name: "username"
            }, {
                type: "password",
                message: "password:",
                name: "password"
            }]);
        const options = {
            method: "POST",
            formData: {
                username,
                password,
                csrf_token
            }
        };
        const response = await this.session.fetch(AtCoder.login_url, options);
        // ログインページ以外にリダイレクトされていればログイン成功とみなす
        const result = response.request.uri.href !== AtCoder.login_url && response.request.uri.href.indexOf(AtCoder.base_url) === 0;
        if (result) {
            // ログインに成功していた場合はセッション情報を保存する
            this.exportCookiesToConfig(this.session.jar);
        }
        return result;
    }
    /**
     * ログインページにアクセスしてCSRFトークンを取得
     */
    async getCSRFToken() {
        const response = await this.session.fetch(AtCoder.login_url);
        const { document } = new jsdom_1.JSDOM(response.body).window;
        const input = (document.getElementsByName("csrf_token")[0]);
        return input.value;
    }
    /**
     * コンテストIDからコンテストの情報を取得
     * @param id
     */
    async contest(id) {
        const url = AtCoder.getContestURL(id);
        const response = await this.session.fetch(url);
        const { document } = new jsdom_1.JSDOM(response.body).window;
        const regexp = /^(.*) - AtCoder$/;
        const title = regexp.test(document.title) ? regexp.exec(document.title)[1] : document.title;
        return { id, title, url };
    }
    /**
     * 問題一覧を取得
     * @param contest
     */
    async tasks(contest) {
        const response = await this.session.fetch(`${AtCoder.getContestURL(contest)}/tasks`);
        const { document } = new jsdom_1.JSDOM(response.body).window;
        // very very ad-hoc and not type-safe section
        const tbody = document.querySelector("#main-div .row table>tbody");
        if (tbody === null)
            return [];
        const tasks = [];
        for (const tr of tbody.querySelectorAll("tr")) {
            // tr>td>a
            const id = tr.children[0].children[0].getAttribute("href").split("/").pop();
            const label = tr.children[0].children[0].text;
            const title = tr.children[1].children[0].text;
            const url = `${AtCoder.base_url}${tr.children[0].children[0].getAttribute("href").substring(1)}`;
            tasks.push({ id, label, title, url });
        }
        return tasks;
    }
    /**
     * Configに保存されたCookie情報を読み込む
     * 引数として与えられたCookieJarの内部状態を書き換えるので、その場合戻り値を再代入する必要はない
     * @param jar 省略された場合は新しいCookieJarを作って返す
     */
    loadCookiesFromConfig(jar) {
        if (jar === undefined)
            jar = request_promise_native_1.default.jar();
        // configからクッキー情報を取得
        const cookies = this.config.get("cookies");
        if (cookies !== undefined) {
            for (const cookie of cookies.split(";")) {
                jar.setCookie(cookie, AtCoder.base_url);
            }
        }
        return jar;
    }
    exportCookiesToConfig(jar) {
        const cookies = jar.getCookieString(AtCoder.base_url);
        this.config.set("cookies", cookies);
    }
}
exports.AtCoder = AtCoder;
