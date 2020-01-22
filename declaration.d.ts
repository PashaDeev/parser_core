/// <reference types="chai" />
/// <reference types="cheerio" />

export declare class ProxyHandler {
	private proxies;
	private currentIndex;
	constructor(pathToProxyFile: string);
	updateProxy(): boolean;
	get(): string;
	getAllProxies(): string[];
}
export interface RequestHeaders {
	"Accept-encoding": string;
	"User-Agent": string;
}
export declare type LoadContent = (url: string, selector: string, headers?: RequestHeaders, proxies?: string[], noHeadless?: boolean) => Promise<CheerioStatic | null>;
export interface SpiderConfig {
	urls: string[];
	selector?: string;
	requestLimit?: number;
	triesLimit?: number;
	proxyHandler?: ProxyHandler;
}
export declare type Requests = {
	[item: string]: Promise<CheerioStatic>;
};
declare class AbstractSpider {
	urls: string[] | string;
	requestLimit: number;
	triesLimit: number;
	getUrl: Function;
	counter: number;
	requests: Requests;
	proxyHandler: ProxyHandler;
	selector: string;
	constructor({ urls, requestLimit, triesLimit, proxyHandler, selector, }: SpiderConfig);
	start(parser: Function): Promise<void>;
}
export declare class Spider extends AbstractSpider {
	getUrl: LoadContent;
	constructor(config: SpiderConfig);
}
export declare class SeleniumSpider extends AbstractSpider {
	getUrl: LoadContent;
	constructor(config: SpiderConfig);
}

export {};
