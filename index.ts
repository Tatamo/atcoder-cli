import request from "request-promise-native"
import {JSDOM} from "jsdom";

(async () => {
	const uri = "https://beta.atcoder.jp/login";
	// ログイン前にGETでアクセスしてCSRF Tokenを取得する
	const getSession = async () => {
		const response = await
			request({
				uri,
				resolveWithFullResponse: true
			});

		const {document} = new JSDOM(response.body).window;
		const input: HTMLInputElement = (document.getElementsByName("csrf_token")[0]) as HTMLInputElement;
		return {cookies: response.headers["set-cookie"], token: input.value};
	};
	const {cookies, token} = await getSession();
	// 得られたCookieを渡す
	const jar = request.jar();
	for (const cookie of cookies) {
		jar.setCookie(request.cookie(cookie)!, uri);
	}
	const options = {
		uri,
		jar,
		followAllRedirects:true,
		method:"POST",
		resolveWithFullResponse: true,
		formData: {
			username: "username",
			password: "wrong_password",
			csrf_token: token
		}
	};
	const response = await request(options);
	console.log(response.body);
})();
