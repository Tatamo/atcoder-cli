import {Session} from "./src/session";

(async () => {
	const session = new Session();
	console.log(await session.check());
	const response = await session.login();
	console.log(response);
	console.log(await session.check());
})();
