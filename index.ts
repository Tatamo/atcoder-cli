import {Session} from "./src/session";

(async () => {
	const session = new Session();
	console.log(await session.login());
})();
