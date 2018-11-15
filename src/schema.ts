/**
 * 普通にJSONファイルとして配置したいが https://github.com/Microsoft/TypeScript/issues/24715 の不具合のためのワークアラウンドとしてプログラム内で定義
 */
const schema = {
	"definitions": {
		"contest": {
			"$id": "#contest",
			"type": "object",
			"required": [
				"id",
				"title",
				"url"
			],
			"properties": {
				"id": {
					"type": "string"
				},
				"title": {
					"type": "string"
				},
				"url": {
					"type": "string"
				}
			}
		},
		"directory": {
			"$id": "#directory",
			"type": "object",
			"required": [
				"path"
			],
			"properties": {
				"path": {
					"type": "string"
				}
			}
		},
		"task": {
			"$id": "#task",
			"type": "object",
			"required": [
				"id",
				"label",
				"title",
				"url"
			],
			"properties": {
				"id": {
					"type": "string"
				},
				"label": {
					"type": "string"
				},
				"title": {
					"type": "string"
				},
				"url": {
					"type": "string"
				},
				"directory": {
					"$ref": "#directory"
				}
			}
		},
		"tasks": {
			"$id": "#tasks",
			"type": "array",
			"items": {
				"$ref": "#task"
			}
		}
	},
	"$schema": "http://json-schema.org/draft-07/schema#",
	"type": "object",
	"title": "atcoder-cli Project File",
	"required": [
		"contest",
		"tasks"
	],
	"properties": {
		"contest": {
			"$ref": "#contest"
		},
		"tasks": {
			"$ref": "#tasks"
		}
	}
};
export default schema;
