import {Design, Injector} from "typesafe-di";
import { Session } from "../session";
import { AtCoder } from "../atcoder";
import { Cookie } from "../cookie";

interface HasCookieConstructor {
    CookieConstructor: typeof Cookie;
}
interface HasSession {
    session: Session;
}

export const CookieDesign = Design.bind('CookieConstructor', ()=> Cookie)

export const SessionDesign = Design.bind('session', async (injector: Injector<HasCookieConstructor>) => 
    new Session(await injector.CookieConstructor)
)

export const AtCoderDesign = Design.bind('atcoder', async (injector: Injector<HasSession>) =>
    new AtCoder(await injector.session)
)

export const productionAtCoderDesign = AtCoderDesign.merge(CookieDesign).merge(SessionDesign)

/**
 * Generate an AtCoder instance for production.
 */
export const getAtCoder = async () => {
    const {
        container: { atcoder }
    } = await productionAtCoderDesign.resolve({});
    return atcoder
};


