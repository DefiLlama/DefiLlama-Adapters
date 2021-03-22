// Imports
const retry = require('async-retry')
const axios = require("axios");
const utils = require('./helper/utils');

// Addresses
const tbtcAddress = '0x8daebade922df735c38c80c7ebd708af50815faa';
const wbtcAddress = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
const renbtcAddress = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';
const sbtcAddress = '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6';
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const btcPoolAddress = '0x4f6A43Ad7cba042606dECaCA730d4CE0A57ac62e';
const usdPoolAddress = '0x3911f80530595fbd01ab1516ab61255d75aeb066'

async function fetch() {
  let tvl = 0;

    const btcTokens = [tbtcAddress, wbtcAddress, renbtcAddress, sbtcAddress]
    const usdTokens = [usdtAddress, daiAddress, usdcAddress]
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'))

    await Promise.all(
        btcTokens.map(async token => {
        let tokenBalance = await utils.returnBalance(token, btcPoolAddress)
        tvl += parseFloat(tokenBalance * price_feed.data.bitcoin.usd);
      }).concat(usdTokens.map(async token=>{
        let tokenBalance = await utils.returnBalance(token, usdPoolAddress)
        tvl += parseFloat(tokenBalance)
      }))
    )

    return tvl;
}

module.exports = {
  fetch
}
