const web3 = require('./config/web3.js');
const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const utils = require('./helper/utils');
const abis = require('./config/uma/abis.js')



async function fetch() {
  let usdc = {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6
  }
  let susd = {
    address: '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
    decimals: 18
  }
  let usdt = {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6
  }
  let dai = {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimals: 18
  }
  let renAddress = {
    address: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
    decimals: 8
  }
  let wbtcAddress = {
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8
  }
  let sbtcAddress = {
    address: '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
    decimals: 18
  }



    var tokens = [dai, usdc, usdt, susd]
    var tvl = 0;
    var pool = '0x2E703D658f8dd21709a7B458967aB4081F8D3d05';
    await Promise.all(
      tokens.map(async token => {
        let tokenBalance = await utils.returnBalance(token.address, pool)
        tvl += parseFloat(tokenBalance);
      })
    )

    var btctokens = [sbtcAddress, renAddress, wbtcAddress]
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

    var pool2 = '0x02Af7C867d6Ddd2c87dEcec2E4AFF809ee118FBb';
    await Promise.all(
      btctokens.map(async token => {
        let tokenBalance = await utils.returnBalance(token.address, pool)
        tvl += parseFloat(tokenBalance * price_feed.data.bitcoin.usd);
      })
    )

    return tvl;
}

module.exports = {
  fetch
}
