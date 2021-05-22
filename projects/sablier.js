const web3 = require('./config/web3.js');

const BigNumber = require("bignumber.js");
const retry = require('./helper/retry')
const axios = require("axios");
const abis = require('./config/abis.js')
const geckoKeys = require('./config/keys.js').keys

const utils = require('./helper/utils');


async function fetch() {
  var pool = '0xA4fc358455Febe425536fd1878bE67FfDBDEC59a'


  let tokens = [
    '0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84',
    '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2',
    '0x1b40183efb4dd766f11bda7a7c3ad8982e998421',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    '0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0',
    '0x903bEF1736CDdf2A537176cf3C64579C3867A881',
    '0xaac41EC512808d64625576EDdd580e7Ea40ef8B2',
    '0x7240aC91f01233BaAf8b064248E80feaA5912BA3'
  ];
  let keys = '';
  await Promise.all(
    tokens.map(async (token) => {
      if (geckoKeys[token.toLowerCase()]) {
        if (geckoKeys[token.toLowerCase()] !== 'stable') {
          keys += geckoKeys[token.toLowerCase()]+','
        }
      } else {
        console.log(token.toLowerCase());
      }
    })
  )
  keys = keys.slice(0, -1)
  let price_feed = await utils.getPricesfromString(keys)
  let tvl = 0;
  await Promise.all(
    tokens.map(async (token) => {
      if (geckoKeys[token.toLowerCase()]) {
        let balance = await utils.returnBalance(token, pool);
        let price = 0;
        if (geckoKeys[token.toLowerCase()] == 'stable') {
          price = 1
        } else {
          price = price_feed.data[geckoKeys[token.toLowerCase()]].usd
        }
        tvl += price * balance
      }
    })
  )



  return tvl;
  //return totalTvl.data.totalTvl.tvlInUsd;
}

module.exports = {
  fetch
}
