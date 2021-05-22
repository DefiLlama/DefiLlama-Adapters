const web3 = require('./config/web3.js');

const BigNumber = require("bignumber.js");
const retry = require('./helper/retry')
const axios = require("axios");
const abis = require('./config/abis.js')
const geckoKeys = require('./config/keys.js').keys

const utils = require('./helper/utils');


async function fetch() {
  var opium = await utils.fetchURL('https://static.opium.network/data/opium-addresses.json');


  let tokens = [
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'
  ]

  let contracts = [
    '0x87a3ef113c210ab35afebe820ff9880bf0dd4bfc',
    '0x25bc339170adbff2b7b9ede682072577fa9d96e8',
    '0x8337706f5faab1941c8b8b849d21b5016987a04a',
    '0xde76305e3379aa5391ffc6028ceec655686c5b0a'
  ]
  let keys = '';
  await Promise.all(
    tokens.map(async (token) => {
      if (geckoKeys[token.toLowerCase()]) {
        if (geckoKeys[token.toLowerCase()] !== 'stable') {
          keys += geckoKeys[token.toLowerCase()]+','
        }
      } else {

      }
    })
  )
  keys = keys.slice(0, -1)
  let price_feed = await utils.getPricesfromString(keys)
  let tvl = 0;
  await Promise.all(
    contracts.map(async (contract) => {
      await Promise.all(
        tokens.map(async (token) => {
          if (geckoKeys[token.toLowerCase()]) {
            let balance = await utils.returnBalance(token, contract);
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
    })
  )

  return tvl;
  //return totalTvl.data.totalTvl.tvlInUsd;
}

module.exports = {
  fetch
}
