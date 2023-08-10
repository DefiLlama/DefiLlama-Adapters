const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
}

const config = {
  ethereum: {
    lvTokens: {
      lvETH: "0x3edbE670D03C4A71367dedA78E73EA4f8d68F2E4",
      lvDCI: "0xf62A24EbE766d0dA04C9e2aeeCd5E86Fac049B7B"
    }
  },
  arbitrum: {
    lvTokens: {
      lvAYI: "0xBE55f53aD3B48B3ca785299f763d39e8a12B1f98"
    },
  }
}

Object.keys(config).forEach(chain => {
  const { lvTokens } = config[chain]
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: Object.values(lvTokens), abi: { asset: 'address:token' } })
  }
})