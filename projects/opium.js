const web3 = require('./config/web3.js');

const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const abis = require('./config/abis.js')
const geckoKeys = require('./config/keys.js').keys

const utils = require('./helper/utils');


async function fetch() {
  var opium = await utils.fetchURL('https://static.opium.network/data/opium-addresses.json');


  let tokens = opium.data.tokens;
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
    opium.data.contracts.map(async (contract) => {
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
