"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const socks_proxy_agent_1 = __importDefault(require("socks-proxy-agent"));
// @ts-ignore
const proxy_1 = __importDefault(require("selenium-webdriver/proxy"));
const selenium_webdriver_1 = require("selenium-webdriver");
const firefox_1 = require("selenium-webdriver/firefox");
const axios_1 = __importDefault(require("axios"));
const debug_1 = __importDefault(require("debug"));
const cheerio_1 = __importDefault(require("cheerio"));
const logger = debug_1.default('core: ');
exports.loadUrlContent = (url, headers, proxy) => __awaiter(void 0, void 0, void 0, function* () {
    // await new Promise(res => setTimeout(() => res(), 1500));
    let client;
    if (proxy) {
        const proxyFull = `socks5://${proxy}`;
        const httpsAgent = new socks_proxy_agent_1.default(proxyFull);
        // client = axios.create({ httpsAgent, headers });
        client = axios_1.default.create({ httpsAgent });
    }
    else {
        // client = axios.create({ headers });
        client = axios_1.default.create();
    }
    const resp = yield client.get(url);
    return cheerio_1.default.load(resp.data);
});
exports.loadUrlContentWithBrowser = (url, headers, ip) => __awaiter(void 0, void 0, void 0, function* () {
    let driver;
    if (ip) {
        const driver = yield new selenium_webdriver_1.Builder()
            .withCapabilities(selenium_webdriver_1.Capabilities.firefox())
            .setFirefoxOptions(new firefox_1.Options().headless())
            // .setProxy(proxy.manual({ https: ip }))
            .setProxy(proxy_1.default.socks(ip, 5))
            .build();
    }
    else {
        const driver = yield new selenium_webdriver_1.Builder()
            .withCapabilities(selenium_webdriver_1.Capabilities.firefox())
            .setFirefoxOptions(new firefox_1.Options().headless())
            .build();
    }
    let str;
    try {
        logger('page getting ...');
        // @ts-ignore
        yield driver.get(url);
        // @ts-ignore
        yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('.pagination')), 20000);
        logger('html getting ...');
        // @ts-ignore
        str = yield driver.findElement(selenium_webdriver_1.By.css('body')).getAttribute('innerHTML');
    }
    catch (err) {
        if (err.name !== 'TimeoutError') {
            logger(err);
        }
    }
    finally {
        // @ts-ignore
        yield driver.quit();
    }
    return str ? cheerio_1.default.load(str) : null;
});
//# sourceMappingURL=utils.js.map