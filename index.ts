import {Session} from "./src/session";

(async () => {
	const session = new Session();
	const response = await session.login();
	console.log(response);
})();
