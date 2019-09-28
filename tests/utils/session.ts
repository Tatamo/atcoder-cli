import { SessionResponseInterface, SessionInterface } from "../../src/session";
import { AxiosRequestConfig } from "axios";

/**
 * Mocked Session whose response can be predefined.
 */
export class TestSession implements SessionInterface {
    private mockResponses: Map<string, Omit<SessionResponseInterface, 'saveSession'>> = new Map()

    async get(url: string, _options?: AxiosRequestConfig): Promise<SessionResponseInterface> {
        const responseObj = this.mockResponses.get(url);
        if (responseObj === undefined) {
            throw new Error("TestSession: network error");
        }
        return {
            ...responseObj,
            saveSession: async ()=>{}
        };
    }
    async post(url: string, _data?: any, options?: AxiosRequestConfig): Promise<SessionResponseInterface> {
        return this.get(url, options);
    }
    transaction<R>(callback: ()=> Promise<R>): Promise<R> {
        return callback();
    }
    async removeSession(): Promise<void> {
    }

    // testing methods
    addMockResponse(url: string, response: Omit<SessionResponseInterface, 'saveSession'>): void {
        this.mockResponses.set(url, response);
    }
}
