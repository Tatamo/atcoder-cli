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

/**
 * Register a contest page response mock.
 */
export function registerContetstPageMock(session: TestSession) {
    session.addGetMockResponse(AtCoder.getContestURL('aic987'), {
        status: 200,
        data: `
        <!DOCTYPE html>
        <html>
        <head>
            <title>問題 - AtCoder Imaginary Contest 987</title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta http-equiv="Content-Language" content='ja'>
            <script>
              var LANG = "ja";
              var userScreenName = "XXX";
              var csrfToken = "???"
            </script>
        </head>
        
        <body>
        <div id="modal-contest-start" class="modal fade" tabindex="-1" role="dialog">
        </div>
        <div id="modal-contest-end" class="modal fade" tabindex="-1" role="dialog">
        </div>
        <div id="main-div" class="float-container">
            <nav class="navbar navbar-inverse navbar-fixed-top">
            </nav>
            <div id="main-container" class="container" style="padding-top:50px;">
        
                <div class="row">
                    <div id="contest-nav-tabs" class="col-sm-12 mb-2 cnvtb-fixed">
                    </div>
                    <div class="col-sm-12">
                        <h2>問題</h2>
                        <hr>
        
                        <div class="panel panel-default table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                <tr>
                                    <th width="3%" class="text-center"></th>
                                    <th>問題名</th>
                                    <th width="10%" class="text-right no-break">実行時間制限</th>
                                    <th width="10%" class="text-right no-break">メモリ制限</th>
                                    <th width="5%"></th>
                                </tr>
                                </thead>
                                <tbody>
        
                                <tr>
                                    <td class="text-center no-break"><a href='/contests/aic987/tasks/aic987_a'>A</a></td>
                                    <td><a href='/contests/aic987/tasks/aic987_a'>This is Problem A</a></td>
                                    <td class="text-right">2 sec</td>
                                    <td class="text-right">1024 MB</td>
        
                                    <td class="no-break text-center">
                                        <a href='/contests/aic987/submit?taskScreenName=aic987_a'>提出</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-center no-break"><a href='/contests/aic987/tasks/aic987_b'>B</a></td>
                                    <td><a href='/contests/aic987/tasks/aic987_b'>Next Problem</a></td>
                                    <td class="text-right">2 sec</td>
                                    <td class="text-right">1024 MB</td>
        
                                    <td class="no-break text-center">
                                        <a href='/contests/aic987/submit?taskScreenName=aic987_b'>提出</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-center no-break"><a href='/contests/aic987/tasks/aic987_c'>C</a></td>
                                    <td><a href='/contests/aic987/tasks/aic987_c'>The Test Cases</a></td>
                                    <td class="text-right">2 sec</td>
                                    <td class="text-right">1024 MB</td>
        
                                    <td class="no-break text-center">
                                        <a href='/contests/aic987/submit?taskScreenName=aic987_c'>提出</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-center no-break"><a href='/contests/aic987/tasks/aic987_d'>D</a></td>
                                    <td><a href='/contests/aic987/tasks/aic987_d'>Imaginary Problem</a></td>
                                    <td class="text-right">4 sec</td>
                                    <td class="text-right">1024 MB</td>
        
                                    <td class="no-break text-center">
                                        <a href='/contests/aic987/submit?taskScreenName=aic987_d'>提出</a>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
        
                        <p class="btn-text-group"></p>
                    </div>
                </div>
                <hr>
                <div class="a2a_kit a2a_kit_size_20 a2a_default_style pull-right" data-a2a-url="https://atcoder.jp/contests/aic987/tasks?lang=ja" data-a2a-title="問題 - AtCoder Imaginary Contest 987">
                </div>
            </div>
            <hr>
        </div>
        <div class="container" style="margin-bottom: 80px;">
            <footer class="footer">
            </footer>
        </div>
        </body>
        </html>
`
    });
}
