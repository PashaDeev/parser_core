import debug from 'debug';
import { ProxyHandler } from './ProxyHandler';

import {
  LoadContent,
  loadUrlContent,
  loadUrlContentWithBrowser,
} from './utils';

const logger = debug('parser: ');
const errorLogger = debug('parser error: ');

interface SpiderConfig {
  urls: string[];
  selector?: string;
  requestLimit?: number;
  triesLimit?: number;
  proxyHandler?: ProxyHandler;
}

type Requests = {
  [item: string]: Promise<CheerioStatic>;
};

class AbstractSpider {
  urls: string[] | string;
  requestLimit: number;
  triesLimit: number;
  getUrl: Function;
  counter: number;
  requests: Requests;
  proxyHandler: ProxyHandler;
  selector: string;

  constructor({
    urls = [],
    requestLimit = 3,
    triesLimit = 3,
    proxyHandler,
    selector = ''
  }: SpiderConfig) {
    this.urls = urls;
    this.requestLimit = requestLimit;
    this.triesLimit = triesLimit;
    this.counter = 0;
    this.selector = selector;

    this.requests = {};

    this.getUrl = () => {
      throw new Error('нужно определить тип загрзчика');
    };
    this.proxyHandler = proxyHandler;
  }

  async start(parser: Function) {
    logger('start spider job');
    logger('start url requests');

    if (!Array.isArray(this.urls)) {
      const response = await this.getUrl(this.urls, undefined, this.proxyHandler && this.proxyHandler.get(), this.selector);
      parser(response);
    }

    const pages: CheerioStatic[] = [];

    const requester = (url: string, reRequest?: boolean): Promise<void> => {
      if (this.counter >= this.urls.length && !reRequest) return;
      if (this.requests[url] && !reRequest) {
        this.counter++;
        return requester(this.urls[this.counter]);
      }

      logger(`start request ${url}`);

      return (this.requests[url] = this.getUrl(
        url,
        undefined,
        this.proxyHandler.get(),
        this.selector
      )
        .then((data: CheerioStatic) => {
          logger(`end request ${url}`);
          if (!data) {
            if (!this.proxyHandler) return null;
            const isProxy = this.proxyHandler.updateProxy();
            if (!isProxy) {
              return errorLogger('end access proxy');
            }
            requester(url, true);
            return null;
          }
          this.counter++;
          const newUrl = this.urls[this.counter];
          requester(newUrl);
          // pages.push(data);
          return data;
        })
        .catch((err: Error) => {
          errorLogger('ошибка запроса');
          if (!this.proxyHandler) return;
          const isProxy = this.proxyHandler.updateProxy();
          if (!isProxy) {
            console.log('err', err)
            return errorLogger('end access proxy');
          }
          requester(url, true);
        }));
    };

    while (this.counter < this.requestLimit) {
      if (this.counter >= this.urls.length) break;
      requester(this.urls[this.counter]);
      this.counter++;
    }

    await Promise.all(Object.values(this.requests));

    for (const url of this.urls) {
      const page = await this.requests[url].then((data) => data);
      pages.push(page);
    };

    logger('end url requests');

    logger('start parser job');
    await parser(pages);
    logger('end parser job');
  }
}

export class Spider extends AbstractSpider {
  getUrl: LoadContent;
  constructor(config: SpiderConfig) {
    super(config);

    this.getUrl = loadUrlContent;
  }
}

export class SeleniumSpider extends AbstractSpider {
  getUrl: LoadContent;
  constructor(config: SpiderConfig) {
    super(config);

    this.getUrl = loadUrlContentWithBrowser;
  }
}
