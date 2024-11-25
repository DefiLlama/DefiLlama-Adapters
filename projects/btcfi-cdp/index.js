const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unwrapLPs')
const { sumTokens } = require("../helper/chain/bitcoin");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const chainPools = {
  bfc: {
    WBTC: { pool: '0xA84F9F42dF222da491571Fb70cCc11AC84B7F29D', token: ADDRESSES.bfc.WBTC },
    BTCB: { pool: '0xee66D8C40282439F2eE855D8a3666FB73257D349', token: ADDRESSES.bfc.BTCB }
  },
}

async function bitcoinTvl() {
  return sumTokens({ owners: await bitcoinAddressBook.btcfi_cdp() })
}

Object.keys(chainPools).forEach(chain => {
  const pools = chainPools[chain]
  const tokensAndOwners = Object.values(pools).map(({ pool, token }) => ([token, pool,]))
  module.exports[chain] = {
    tvl: sumTokensExport({ tokensAndOwners })
  }
})

module.exports["bitcoin"] = { tvl: bitcoinTvl }