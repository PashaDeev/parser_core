const { describe, it } = require('mocha');
const { expect, should } = require('chai');
const { join } = require('path');

const { ProxyHandler } = require('../dist/ProxyHandler');
const { Spider } = require('../dist/parser');

describe('test Spider', () => {
  it('check', async () => {
    const proxyHandler = new ProxyHandler(join(__dirname, 'socks5.csv'));
    const spider = new Spider({ proxyHandler, urls: ['http://yandex.ru', 'http://rambler.ru'] });
    const func = (pages) => {
      pages.forEach((page) => {
        console.log(page.text())
      });
    };
    await spider.start(func);
  });
});
