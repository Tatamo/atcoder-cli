"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conf_1 = __importDefault(require("conf"));
/**
 * 常に単一のConfインスタンスを返す関数
 */
const getConfig = (() => {
    // confはsingletonとして扱う
    let conf = null;
    return () => {
        if (conf !== null)
            return conf;
        return conf = new conf_1.default();
    };
})();
exports.default = getConfig;
