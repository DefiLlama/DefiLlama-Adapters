const ADDRESSES = require('../helper/coreAssets.json')
const BTC_MARKET = "0xB7C609cFfa0e47DB2467ea03fF3e598bF59361A5"
const PUMP_MARKET = "0xc97Bd36166f345aB1C5d97c9DF196Ee6fFA2485e"
const USDT = ADDRESSES.corn.USDT0

async function tvl(api) {
  const markets = [BTC_MARKET, PUMP_MARKET];
  const tokens = markets.map(() => USDT); // Same token for all markets
  
  return api.sumTokens({ tokensAndOwners2: [tokens, markets] })
}

module.exports = {
  methodology: 'Sum of all USDT deposits in BTC and PUMP Markets',
  start: 6195000,
  hyperliquid: {
    tvl,
  }
};
