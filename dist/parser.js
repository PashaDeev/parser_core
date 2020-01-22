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
const debug_1 = __importDefault(require("debug"));
const utils_1 = require("./utils");
const logger = debug_1.default('parser: ');
logger.log = console.log.bind(console);
const errorLogger = debug_1.default('parser error: ');
errorLogger.log = console.log.bind(console);
class AbstractSpider {
    constructor({ urls = [], requestLimit = 3, triesLimit = 3, proxyHandler, selector = '', }) {
        this.urls = urls;
        this.requestLimit = requestLimit;
        this.triesLimit = triesLimit;
        this.counter = 0;
        this.selector = selector;
        logger('create spider with params:');
        logger(`urls: ${this.urls}`);
        logger(`selector: ${this.selector}`);
        logger(`request limit ${this.requestLimit}`);
        this.requests = {};
        this.getUrl = () => {
            throw new Error('нужно определить тип загрзчика');
        };
        this.proxyHandler = proxyHandler;
    }
    start(parser) {
        return __awaiter(this, void 0, void 0, function* () {
            logger('start spider job');
            logger('start url requests');
            if (!Array.isArray(this.urls)) {
                const response = yield this.getUrl(this.urls, this.selector, undefined, this.proxyHandler && this.proxyHandler.getAllProxies());
                parser(response);
            }
            const pages = [];
            let mainResolve;
            const mainPromise = new Promise(res => (mainResolve = res));
            const requester = (url, reRequest) => __awaiter(this, void 0, void 0, function* () {
                if (this.counter >= this.urls.length && !reRequest)
                    return null;
                if (this.requests[url] && !reRequest) {
                    this.counter++;
                    return requester(this.urls[this.counter]);
                }
                logger(`start request ${url}`);
                return (this.requests[url] = this.getUrl(url, this.selector, undefined, this.proxyHandler.getAllProxies()).then((data) => {
                    logger(`end request ${url}`);
                    this.counter++;
                    const newUrl = this.urls[this.counter];
                    requester(newUrl);
                    return data;
                }));
            });
            while (this.counter < this.requestLimit) {
                if (this.counter >= this.urls.length)
                    break;
                requester(this.urls[this.counter]);
                this.counter++;
            }
            yield Promise.all(Object.values(this.requests));
            for (const url of this.urls) {
                const page = yield this.requests[url].then(data => data);
                // const filteredPages = page.filter(Boolean);
                pages.push(page);
            }
            logger('end url requests');
            logger('start parser job');
            yield parser(pages.filter(Boolean));
            logger('end parser job');
        });
    }
}
class Spider extends AbstractSpider {
    constructor(config) {
        super(config);
        this.getUrl = utils_1.loadUrlContent;
    }
}
exports.Spider = Spider;
class SeleniumSpider extends AbstractSpider {
    constructor(config) {
        super(config);
        this.getUrl = utils_1.loadUrlContentWithBrowser;
    }
}
exports.SeleniumSpider = SeleniumSpider;
//# sourceMappingURL=parser.js.map