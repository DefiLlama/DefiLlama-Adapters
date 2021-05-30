// Money on Chain exists on the RSK chain
// Based on four tokens:
// The DoC, a USD price pegged Stablecoin token.
// The BPro (Bitpro) a token designed for BTC hodlers, to earn a rent on Bitcoin and gain free leverage.
// The BTCx, a token that represents a leveraged long bitcoin holding position.
// The MoC token, designed to govern a decentralized autonomous organization (DAO) that will govern the Smart Contracts.


// Various API endpoints: https://api.moneyonchain.com/api/report/

// stats from https://moneyonchain.com/stats/
const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
async function fetch() {
  // Money on Chain measures TVL as MoC+RoC
  let tvl_feed = await retry(async bail => await axios.get('https://api.moneyonchain.com/api/report/mocMainnet2/USDinSystem'))
  let tvl_latest = tvl_feed.data.values[tvl_feed.data.values.length-1]
  
  //MoC (Money on Chain)
  // console.log('%s', tvl_latest.MoC)
  // let tvl = new BigNumber(tvl_latest.Total).toFixed(2);
  
  //RoC (Rif on Chain)
  // console.log('%s', tvl_latest.RoC)
  // let tvl = new BigNumber(tvl_latest.Total).toFixed(2);
  
  //Total
  //console.log('%s', tvl_latest.Total)
  let tvl = new BigNumber(tvl_latest.Total).toFixed(2);
  return tvl;
}
module.exports = {
   fetch
}