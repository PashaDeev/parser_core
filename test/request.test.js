const { describe, it } = require('mocha');
const { expect, should } = require('chai');
const { join } = require('path');

const { loadUrlContent } = require('../dist/utils');

const proxy = '198.199.119.119:1080';

describe('load url content', () => {
  it('get addres', async () => {
    const $ = await loadUrlContent('http://yandex.ru')
  });
  it('get addres with proxy', async () => {
    const $ = await loadUrlContent('http://yandex.ru', undefined, proxy)
  });
});
