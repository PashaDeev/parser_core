const { describe, it } = require('mocha');
const { expect, should } = require('chai');
const { join } = require('path');

const { ProxyHandler } = require('../dist/ProxyHandler');

describe('test proxy handler', () => {
  it('get proxies', () => {
    const proxyHandler = new ProxyHandler(join(__dirname, 'socks5.csv'));
    expect(proxyHandler.getAllProxies()).to.have.length(3);
  });

  it('update proxy', () => {
    const proxyHandler = new ProxyHandler(join(__dirname, 'socks5.csv'));
    const firstIp = proxyHandler.get();

    proxyHandler.updateProxy();

    const secondIp = proxyHandler.get();
    expect(firstIp).not.equal(secondIp);
  });

  it('on end proxy', () => {
    const proxyHandler = new ProxyHandler(join(__dirname, 'socks5.csv'));
    proxyHandler.updateProxy();
    proxyHandler.updateProxy();

    should().exist(proxyHandler.get());

    proxyHandler.updateProxy();

    should().not.exist(proxyHandler.get());
  })
});
