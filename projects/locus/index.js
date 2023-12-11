const { sumERC4626VaultsExport } = require('../helper/erc4626')
const { staking } = require('../helper/staking')

const Locus_Token = "0xe1d3495717f9534db67a6a8d4940dd17435b6a9e"
const stLocus = "0xEcc5e0c19806Cf47531F307140e8b042D5Afb952"

module.exports = {
  doublecounted: true,
}

const config = {
  ethereum: {
    lvTokens: {
      lvETH: "0x0e86f93145d097090acbbb8ee44c716dacff04d7",
      lvDCI: "0x65b08FFA1C0E1679228936c0c85180871789E1d7",
      lvETH_v1: "0x3edbE670D03C4A71367dedA78E73EA4f8d68F2E4",
      lvDCI_v1: "0xf62A24EbE766d0dA04C9e2aeeCd5E86Fac049B7B",

    }
  },
  arbitrum: {
    lvTokens: {
      lvAYI: "0x0f094f6deb056af1fa1299168188fd8c78542a07",
      lvAYI_v1: "0xBE55f53aD3B48B3ca785299f763d39e8a12B1f98",
      lyUSD: "0x6c090e79a9399c0003a310e219b2d5ed4e6b0428",
    },
  }
}

Object.keys(config).forEach(chain => {
  const { lvTokens } = config[chain]
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: Object.values(lvTokens), abi: { asset: 'address:token' } })
  }
})

module.exports.arbitrum.staking = staking(stLocus, Locus_Token)