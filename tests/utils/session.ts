import { SessionResponseInterface, SessionInterface } from "../../src/session";
import { AxiosRequestConfig } from "axios";

interface MockResponse {
    status: number;
    data: string;
    headers?: SessionResponseInterface["headers"]
}
/**
 * Mocked Session whose response can be predefined.
 */
export class TestSession implements SessionInterface {
    private getMockResponses: Map<string, MockResponse> = new Map()
    private postMockResponses: Map<string, MockResponse> = new Map()

    async get(url: string, _options?: AxiosRequestConfig): Promise<SessionResponseInterface> {
        const responseObj = this.getMockResponses.get(url);
        if (responseObj === undefined) {
            throw new Error("TestSession: network error");
        }
        return {
            headers: {},
            ...responseObj,
            saveSession: async ()=>{}
        };
    }
    async post(url: string, _data?: any, options?: AxiosRequestConfig): Promise<SessionResponseInterface> {
        const responseObj = this.postMockResponses.get(url);
        console.log(url, responseObj)
        if (responseObj === undefined) {
            throw new Error("TestSession: network error");
        }
        return {
            headers: {},
            ...responseObj,
            saveSession: async ()=>{}
        };
    }
    transaction<R>(callback: ()=> Promise<R>): Promise<R> {
        return callback();
    }
    async removeSession(): Promise<void> {
    }

    // testing methods
    addGetMockResponse(url: string, response: MockResponse): void {
        this.getMockResponses.set(url, response);
    }
    addPostMockResponse(url: string, response: MockResponse): void {
        this.postMockResponses.set(url, response);
    }
}
