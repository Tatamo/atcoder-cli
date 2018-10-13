import request from "request-promise-native"
import {JSDOM} from "jsdom";
import inquirer from "inquirer";

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

	// ユーザーネームとパスワードを入力させる
	const {username, password} = await inquirer.prompt([{
		type: "input",
		message: "username:",
		name: "username"
	}, {
		type: "password",
		message: "password:",
		name: "password"
	}]) as { username: string, password: string };


	const options = {
		uri,
		jar,
		followAllRedirects: true,
		method: "POST",
		resolveWithFullResponse: true,
		formData: {
			username,
			password,
			csrf_token: token
		}
	};
	const response = await request(options);
	console.log(response.headers);
})();
