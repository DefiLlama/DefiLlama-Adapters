const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unwrapLPs')
const { sumTokens } = require("../helper/chain/bitcoin");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const chainPools = {
  bfc: {
    WBTC: { pool: '0xA84F9F42dF222da491571Fb70cCc11AC84B7F29D', token: ADDRESSES.bfc.WBTC },
    BTCB: { pool: '0xee66D8C40282439F2eE855D8a3666FB73257D349', token: ADDRESSES.bfc.BTCB },
  },
  core: {
    WBTC: { pool: '0x872b347cd764d46c127ffefbcaB605FFF3f3a48C', token: "0x7A6888c85eDBA8E38F6C7E0485212da602761C08" },
    BTCB: { pool: '0x872b347cd764d46c127ffefbcaB605FFF3f3a48C', token: "0x5832f53d147b3d6Cd4578B9CBD62425C7ea9d0Bd" }
  },
  base: {
    cbBTC: { pool: '0x4F7aB59b5AC112970F5dD66D8a7ac505c8E5e08B', token: ADDRESSES.ethereum.cbBTC }
  }
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