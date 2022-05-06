const { staking } = require('../helper/staking');
const utils = require('../helper/utils');
const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function bnb() {
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    let response = await retry(async bail => await axios.get('https://scan.lachain.io/api?module=stats&action=tokensupply&contractaddress=0x9483bDd8e088a2241f20F9241eFa3e3F6288ee20'))
    let tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(6);
    
    // console.log("bnb price_feed:: ", price_feed.data.binancecoin.usd)
    // console.log("bnb tvl tokens:: ", tvl)

    return tvl * price_feed.data.binancecoin.usd
}

async function polygon() {
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    let response = await retry(async bail => await axios.get('https://scan.lachain.io/api?module=stats&action=tokensupply&contractaddress=0xC9AE905f288A3A3591CA7eee328eEd1568C14F32'))
    let tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(6);
    
    // console.log("polygon price_feed:: ", price_feed.data['matic-network'].usd)
    // console.log("polygon tvl tokens:: ", tvl)

    return tvl * price_feed.data['matic-network'].usd
}

async function latoken() {
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=latoken&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    let response = await retry(async bail => await axios.get('https://scan.lachain.io/api?module=stats&action=tokensupply&contractaddress=0x3a898D596840C6B6b586d722bFAdCC8c4761BF41'))
    let tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(6);

    // console.log("latoken price_feed:: ", price_feed.data.latoken.usd)
    // console.log("latoken tvl tokens:: ", tvl)

    return tvl * price_feed.data.latoken.usd
}

async function eth() {
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    let response = await retry(async bail => await axios.get('https://scan.lachain.io/api?module=stats&action=tokensupply&contractaddress=0x5ce9084e8ADa946AF09200c80fbAbCb1245E477F'))
    let tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(6);
    
    // console.log("ethereum price_feed:: ", price_feed.data.ethereum.usd)
    // console.log("ethereum tvl tokens:: ", tvl)

    return tvl * price_feed.data.ethereum.usd
}

async function avax() {
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    let response = await retry(async bail => await axios.get('https://scan.lachain.io/api?module=stats&action=tokensupply&contractaddress=0x690594910c2d58869d5F3FF205ebA1ff2A1B8245'))
    let tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(6);
    
    // console.log("avalanche-2 price_feed:: ", price_feed.data['avalanche-2'].usd)
    // console.log("avalanche-2 tvl tokens:: ", tvl)

    return tvl * price_feed.data['avalanche-2'].usd
}

async function fantom() {
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=fantom&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    let response = await retry(async bail => await axios.get('https://scan.lachain.io/api?module=stats&action=tokensupply&contractaddress=0x8c2E35a5825Ab407d2718402D15fFa8ec6D19acf'))
    let tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(6);

    // console.log("fantom price_feed:: ", price_feed.data.fantom.usd)
    // console.log("fantom tvl tokens:: ", tvl)

    return tvl * price_feed.data.fantom.usd
}

async function harmony() {
    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=harmony&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    let response = await retry(async bail => await axios.get('https://scan.lachain.io/api?module=stats&action=tokensupply&contractaddress=0xC224866E0d39AC2d104Dd28F6398F3548ae0f318'))
    let tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(6);
    
    // console.log("harmony price_feed:: ", price_feed.data.harmony.usd)
    // console.log("harmony tvl tokens:: ", tvl)

    return tvl * price_feed.data.harmony.usd
}

async function fetch() {
  return (await bnb())+(await polygon()) + (await latoken()) + (await eth())+(await avax())+(await fantom()) +(await harmony())
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  bsc:{
    fetch: bnb
  },
  polygon:{
    fetch: polygon
  },
  lachain:{
    fetch: latoken
  },
  ethereum:{
    fetch: eth
  },
  avalanche:{
    fetch: avax
  },
  fantom: {
    fetch: fantom
  },
  harmony:{
    fetch: harmony,
  },
  fetch
}
