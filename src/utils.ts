// @ts-ignore
import SocksProxyAgent from 'socks-proxy-agent';
// @ts-ignore
import proxy from 'selenium-webdriver/proxy';
import { Builder, until, By, Capabilities } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';
import axios from 'axios';
import debug from 'debug';
import { ProxyHandler } from './ProxyHandler';

import { RequestHeaders } from './types';
import cheerio from 'cheerio';

const seleniumProxy = proxy;

const logger = debug('core: ');
logger.log = console.log.bind(console);

export type LoadContent = (
  url: string,
  selector: string,
  headers?: RequestHeaders,
  proxies?: string[],
  noHeadless?: boolean
) => Promise<CheerioStatic | null>;

export const loadUrlContent: LoadContent = async (
  url,
  selector = '',
  headers,
  proxies = [null]
) => {
  // await new Promise(res => setTimeout(() => res(), 1500));
  let i = 0;
  while (i < proxies.length) {
      const proxy = proxies[i];
      logger(`request with proxy: ${proxy}`);

      let client;
      if (proxy) {
        const proxyFull = `socks5://${proxy}`;
        const httpsAgent = new SocksProxyAgent(proxyFull);

        // client = axios.create({ httpsAgent, headers });
        client = axios.create({ httpsAgent });
      } else {
        // client = axios.create({ headers });
        client = axios.create();
      }

    try {
      const resp = await client.get(url);
      return cheerio.load(resp.data);
    } catch (err) {
      i++;
    }
  }
  return null;
};

export const loadUrlContentWithBrowser: LoadContent = async (
  url,
  selector,
  headers,
  proxies = [null],
  noHeadless,
): Promise<CheerioStatic | null> => {
  let i = 0;

  while (i < proxies.length) {
    const proxy = proxies[i];
    logger(`request with proxy: ${proxy}`);
    let driver = await new Builder().withCapabilities(Capabilities.firefox());

    if (!noHeadless) {
      driver = await new Builder()
        .withCapabilities(Capabilities.firefox())
        .setFirefoxOptions(new Options().headless());
    }

    if (proxy) {
      driver = await driver.setProxy(seleniumProxy.socks(proxy, 5));
    }

    // @ts-ignore
    driver = await driver.build();

    let str;
    try {
      logger('page getting ...');
      // @ts-ignore
      await driver.get(url);
      logger(`wait for ${selector} selector`);
      // @ts-ignore
      await driver.wait(until.elementLocated(By.css(selector)), 20000);
      logger('html getting ...');
      // @ts-ignore
      str = await driver.findElement(By.css('body')).getAttribute('innerHTML');
      return cheerio.load(str);
    } catch (err) {
      if (err.name !== 'TimeoutError') {
        logger(err);
      }
      i++;
    } finally {
      // @ts-ignore
      await driver.quit();
    }
  }
  return null;
};
