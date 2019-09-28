import { TestSession } from "./session";
import { AtCoder } from "../../src/atcoder";

/**
 * Register a mock for submit page (for check).
 */
export function addLoggedInCheckMock(session: TestSession) {
    // ログイン時は200
    session.addGetMockResponse(AtCoder.getContestURL('abc001') + '/submit', {
        status: 200,
        data: ''
    })
}

/**
 * Register a mock for submit page (for check).
 */
export function addNonLoggedInCheckMock(session: TestSession) {
    // ログインしていない時は302
    session.addGetMockResponse(AtCoder.getContestURL('abc001') + '/submit', {
        status: 302,
        headers: {
            location: '/login'
        },
        data: ''
    })
}

/**
 * Register a mock response for login related pages.
 */
export function addLoginPageMock(session: TestSession) {
	// トップページの挙動
	const csrfToken = "csrfCSRFcSRfCsrFCsRfCsrfcSRfCsRf"
	session.addGetMockResponse(AtCoder.login_url, {
		status: 200,
		data: `
			<h2>ログイン</h2>
			<input type="hidden" name="csrf_token" value="${csrfToken}" />
		`
	})
	// Login成功時の挙動をモック
	session.addPostMockResponse(AtCoder.login_url, {
		status: 302,
		headers: {
			location: AtCoder.base_url
		},
		data: ''
	})
}
