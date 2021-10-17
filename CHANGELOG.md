# Changelog

## [2.2.0]
### Added
- `task` and `contest` commands have some options to filter output ([#41](https://github.com/Tatamo/atcoder-cli/pull/41))

## [2.1.1]
### Fixed
- Format strings in `task.submit` parameter in `template.json` did not work ([#37](https://github.com/Tatamo/atcoder-cli/pull/37))
### Security
- Bump dependencies ([#31](https://github.com/Tatamo/atcoder-cli/pull/31), [#32](https://github.com/Tatamo/atcoder-cli/pull/32), [#33](https://github.com/Tatamo/atcoder-cli/pull/33), [#34](https://github.com/Tatamo/atcoder-cli/pull/34), [#35](https://github.com/Tatamo/atcoder-cli/pull/35))

## [2.1.0]
### Added
- Enable to pass arguments to online-judge-tools in submit command and add --skip-filename option ([#26](https://github.com/Tatamo/atcoder-cli/pull/26)) **experimental: this feature may be changed in further release**
### Security
- Bump dependencies ([#24](https://github.com/Tatamo/atcoder-cli/pull/24))

## [2.0.5]
### Added
- This CHANGELOG! ([#21](https://github.com/Tatamo/atcoder-cli/pull/21))
- Update notifications are available after this version ([#23](https://github.com/Tatamo/atcoder-cli/pull/23))
### Fixed
- Non-existent option `default-new-contest-cmd` was documented in the help, now deleted. Use template functions instead ([#22](https://github.com/Tatamo/atcoder-cli/pull/22))
### Security
- Bump dependencies ([#19](https://github.com/Tatamo/atcoder-cli/pull/19))
### Dev/Internal
- Write many tests for reliability
