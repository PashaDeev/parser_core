import { readFileSync } from 'fs-extra';
import { parse as csvParse } from 'csv/lib/sync';
import debug from 'debug';

const logger = debug('proxy handler: ');
logger.log = console.log.bind(console);

type Proxy = [string, string];

export class ProxyHandler {
  private proxies: string[];
  private currentIndex: number;

  constructor(pathToProxyFile: string) {
    this.currentIndex = 0;
    const file = readFileSync(pathToProxyFile);
    this.proxies = csvParse(file).map((item: Proxy) => item.join(':'));

    logger(`use proxy: ${this.get()}`)
  }

  updateProxy(): boolean {
    this.currentIndex++;
    logger(`use proxy: ${this.get()}`);
    return this.currentIndex < this.proxies.length;
  }

  get(): string {
    if (this.currentIndex >= this.proxies.length) return null;
    return this.proxies[this.currentIndex];
  }

  getAllProxies(): string[] {
    return this.proxies;
  }
}
