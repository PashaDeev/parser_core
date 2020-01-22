import { readFileSync } from 'fs-extra';
import { parse as csvParse } from 'csv/lib/sync';
import debug from 'debug';

const logger = debug('proxy handler: ');

type Proxy = [string, string];

class Clone {
  proxies: Proxy[];
  currentIndex: number;

  constructor(proxies: Proxy[]) {
    this.proxies = proxies;
    this.currentIndex = 0;
  }

  updateProxy(): boolean {
    this.currentIndex++;
    logger(`use proxy: ${this.get()}`);
    return this.currentIndex < this.proxies.length;
  }

  get(): string {
    if (this.currentIndex >= this.proxies.length) return null;
    return this.proxies[this.currentIndex].join(':');
  }
}

export class ProxyHandler {
  private proxies: Proxy[];
  private currentIndex: number;

  constructor(pathToProxyFile: string) {
    this.currentIndex = 0;
    const file = readFileSync(pathToProxyFile);
    this.proxies = csvParse(file);

    logger(`use proxy: ${this.get()}`)
  }

  updateProxy(): boolean {
    this.currentIndex++;
    logger(`use proxy: ${this.get()}`);
    return this.currentIndex < this.proxies.length;
  }

  get(): string {
    if (this.currentIndex >= this.proxies.length) return null;
    return this.proxies[this.currentIndex].join(':');
  }

  getAllProxies(): Proxy[] {
    return this.proxies;
  }

  getClone() {
    return new Clone(this.proxies);
  }
}
