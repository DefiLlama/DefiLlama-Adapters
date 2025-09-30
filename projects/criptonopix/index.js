const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// List of addresses to monitor
const TARGET_ADDRESSES = [
  "0xF952A11EB1456316e907f0B47b0dccd66c28B8B3",
  "0x317ba109B74F272253cF8f36c24331FBC5619f59",
  "0x36f15b07ebe31e05c4fcEb562bf973663EEB6Bf5",
  "0x6E653a3f76eCE9C3b1849b2159fDdf3bB20f0DF4",
  "0x16F1b9B34F2596c5538E0ad1B10C85D4B2820b82",
]

async function tvl(api) {
  // sumTokens2 automatically performs balanceOf calls
  return sumTokens2({
    api,
    tokens: [ADDRESSES.bsc.USDT],
    owners: TARGET_ADDRESSES,
  })
}

module.exports = {
  timetravel: true,
  methodology: "Sums the USDT balances held in a fixed list of addresses using helper sumTokens2.",
  start: 19632198, 
  bsc: {
    tvl,
  },
}
