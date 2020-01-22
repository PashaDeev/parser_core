"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const sync_1 = require("csv/lib/sync");
const debug_1 = __importDefault(require("debug"));
const logger = debug_1.default('proxy handler: ');
logger.log = console.log.bind(console);
class ProxyHandler {
    constructor(pathToProxyFile) {
        this.currentIndex = 0;
        const file = fs_extra_1.readFileSync(pathToProxyFile);
        this.proxies = sync_1.parse(file).map((item) => item.join(':'));
        logger(`use proxy: ${this.get()}`);
    }
    updateProxy() {
        this.currentIndex++;
        logger(`use proxy: ${this.get()}`);
        return this.currentIndex < this.proxies.length;
    }
    get() {
        if (this.currentIndex >= this.proxies.length)
            return null;
        return this.proxies[this.currentIndex];
    }
    getAllProxies() {
        return this.proxies;
    }
}
exports.ProxyHandler = ProxyHandler;
//# sourceMappingURL=ProxyHandler.js.map