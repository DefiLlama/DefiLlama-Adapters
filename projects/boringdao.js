const web3 = require('./config/web3.js');

const BigNumber = require("bignumber.js");
const retry = require('./helper/retry')
const axios = require("axios");
const abis = require('./config/boringdao/abis.js')
const utils = require('./helper/utils');

async function fetch() {

  let tvl = 0;
  let tunnel = '0x258a1eb6537ae84cf612f06b557b6d53f49cc9a1';
  const tunnelContract = new web3.eth.Contract(abis.abis.tunnel, tunnel)

  let tvl1 = await tunnelContract.methods.totalTVL().call()
  tvl += parseFloat(new BigNumber(tvl1).div(10 ** 18).toFixed(2));

  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
  let response = await retry(async bail => await axios.get('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0x8064d9Ae6cDf087b1bcd5BDf3531bD5d8C537a68&apikey=H6NGIGG7N74TUH8K2X31J1KB65HFBH2E82'))
  tvl += (parseFloat(new BigNumber(response.data.result).div(10 ** 18).toFixed(2)) * price_feed.data.bitcoin.usd);
  return tvl;

}


module.exports = {
  fetch
}



// contract：
//
// Tunnel: 0x258a1eb6537ae84cf612f06b557b6d53f49cc9a1
//
// oBTC: 0x8064d9Ae6cDf087b1bcd5BDf3531bD5d8C537a68
//
// Oracle: 0x43B41E120FF06622D122d5B54FA378ADE1E7D4cb
//
// parameter：
//
// BTC bytes32(“BTC”):
//
// 0x4254430000000000000000000000000000000000000000000000000000000000
//
// TVL Calculation：
//
// 1. Call tunnel contract: totalTVL()function，get the total value of tunnel
// pledged ($BOR) and variety tokens of Satellite City pledged, Divide the returned value by 10 to the 18th power, convert the unit to USD, and define it as TVL1.
// 2. Call Oracle contract price of() function,send “BTC” byte32 as parameter.
// 3. Call oBTC contract totalSupply() function for total obtc quantities, and then  obtc quantities multiplied by the btc price，get the total value of obtc, as TVL2
// 4. TVL(total) = tvl1+ tvl2
//
// note：
//
// The returned Oracle price is also 18 bit，so if BTC price is $18000，the value you get from Oracle will be 18000*10^18.
