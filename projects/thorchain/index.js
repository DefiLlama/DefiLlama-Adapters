const { get } = require('../helper/http');

let allTVLData

async function getTvl(chain) {
  if (!allTVLData)
    allTVLData = await get('https://api.flipsidecrypto.com/api/v2/queries/6c43c12d-eeb3-456a-9f51-b5f1a63df64e/data/latest');
  return allTVLData.find(x => x.CHAIN == chain).TVL
}
async function bch() {
  return(getTvl('BCH'));
}
async function bnb() {
  return(getTvl('BNB'));
}
async function btc() {
  return(getTvl('BTC'));
}
async function doge() {
  return(getTvl('DOGE'));
}
async function eth() {
  return(getTvl('ETH'));
}
async function ltc() {
  return(getTvl('LTC'));
}
// async function terra() {
//   return(getTvl('TERRA'));
// }

async function fetch() {
  return (
    await bch())
    + (await bnb())
    + (await btc())
    + (await doge())
    + (await eth())
    + (await ltc())
    // + (await terra())
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Pulls TVL from each THORChain pool using Flipside Crypto data',
  bch:{
    fetch: bch
  },
  binance:{
    fetch: bnb
  },
  bitcoin:{
    fetch: btc
  },
  dogecoin:{
    fetch: doge
  },
  ethereum:{
    fetch: eth
  },
  litecoin:{
    fetch: ltc
  },
  // terra:{
  //   fetch: terra
  // },
  fetch
}
