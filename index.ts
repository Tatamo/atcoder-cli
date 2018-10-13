import request from "request-promise-native"
import {JSDOM} from "jsdom";
import inquirer from "inquirer";

(async () => {
	const uri = "https://beta.atcoder.jp/login";
	// ログイン前にGETでアクセスしてCookieとCSRF Tokenを取得する
	const getSession = async () => {
		const jar = request.jar();
		const response = await
			request({
				uri,
				jar,
				resolveWithFullResponse: true
			});

		const {document} = new JSDOM(response.body).window;
		const input: HTMLInputElement = (document.getElementsByName("csrf_token")[0]) as HTMLInputElement;
		return {jar, token: input.value};
	};
	const {jar, token} = await getSession();

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
	// console.log(jar);
	console.log(response.headers);
})();
