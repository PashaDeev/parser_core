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

const logger = debug('core: ');

export type LoadContent = (
  url: string,
  selector: string,
  headers?: RequestHeaders,
  proxyhandler?: ProxyHandler,
  noHeadless?: boolean
) => Promise<CheerioStatic | null>;

export const loadUrlContent: LoadContent = async (
  url,
  selector = '',
  headers,
  proxyHandler
) => {
  // await new Promise(res => setTimeout(() => res(), 1500));

  let resp;

  while (!resp && proxyHandler.get()) {
    let client;
    try {
      if (proxy) {
        const proxyFull = `socks5://${proxy.get()}`;
        const httpsAgent = new SocksProxyAgent(proxyFull);

        // client = axios.create({ httpsAgent, headers });
        client = axios.create({ httpsAgent });
      } else {
        // client = axios.create({ headers });
        client = axios.create();
      }
    } catch (err) {
      proxyHandler.updateProxy();
      continue;
    }
    resp = await client.get(url);
  }
  return cheerio.load(resp.data) || null;
};

export const loadUrlContentWithBrowser: LoadContent = async (
  url,
  selector,
  headers,
  proxyHandler,
  noHeadless
): Promise<CheerioStatic | null> => {
  let resp;
  while (!resp && proxyHandler.get()) {
    try {
      let driver = await new Builder().withCapabilities(Capabilities.firefox());

      if (!noHeadless) {
        driver = await new Builder()
          .withCapabilities(Capabilities.firefox())
          .setFirefoxOptions(new Options().headless());
      }

      if (proxyHandler.get()) {
        driver = await driver.setProxy(proxy.socks(proxyHandler.get(), 5));
      }

      // @ts-ignore
      driver = await driver.build();

      let str;
      logger('page getting ...');
      // @ts-ignore
      await driver.get(url);
      // @ts-ignore
      await driver.wait(until.elementLocated(By.css(selector)), 20000);
      logger('html getting ...');
      // @ts-ignore
      str = await driver.findElement(By.css('body')).getAttribute('innerHTML');
      return str ? cheerio.load(str) : null;
    } catch (err) {
      if (err.name !== 'TimeoutError') {
        logger(err);
      }
      proxyHandler.updateProxy();
      // @ts-ignore
      await driver.quit();
      continue;
    }
  }
  return null;
};
