// @ts-ignore
import SocksProxyAgent from 'socks-proxy-agent';
// @ts-ignore
import proxy from 'selenium-webdriver/proxy';
import { Builder, until, By, Capabilities } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';
import axios from 'axios';
import debug from 'debug';

import { RequestHeaders } from './types';
import cheerio from 'cheerio';

const logger = debug('core: ');

export type LoadContent = (
  url: string,
  headers?: RequestHeaders,
  proxy?: string,
  noHeadless?: boolean
) => Promise<CheerioStatic | null>;

export const loadUrlContent: LoadContent = async (url, headers, proxy) => {
  // await new Promise(res => setTimeout(() => res(), 1500));
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

  const resp = await client.get(url);
  return cheerio.load(resp.data);
};

export const loadUrlContentWithBrowser: LoadContent = async (
  url,
  headers,
  ip,
  noHeadless
): Promise<CheerioStatic | null> => {
  let driver = await new Builder().withCapabilities(Capabilities.firefox());

  if (!noHeadless) {
    driver = await new Builder()
      .withCapabilities(Capabilities.firefox())
      .setFirefoxOptions(new Options().headless());
  }

  if (ip) {
    driver = await driver.setProxy(proxy.socks(ip, 5));
  }

  // @ts-ignore
  driver = await driver.build();

  let str;
  try {
    logger('page getting ...');
    // @ts-ignore
    await driver.get(url);
    // @ts-ignore
    await driver.wait(until.elementLocated(By.css('.pagination')), 20000);
    logger('html getting ...');
    // @ts-ignore
    str = await driver.findElement(By.css('body')).getAttribute('innerHTML');
  } catch (err) {
    if (err.name !== 'TimeoutError') {
      logger(err);
    }
  } finally {
    // @ts-ignore
    await driver.quit();
  }
  return str ? cheerio.load(str) : null;
};
