const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
}

const config = {
  ethereum: {
    lvTokens: {
      lvETH: "0x0e86f93145d097090acbbb8ee44c716dacff04d7",
      lvDCI: "0x65b08FFA1C0E1679228936c0c85180871789E1d7"
    }
  },
  arbitrum: {
    lvTokens: {
      lvAYI: "0x0f094f6deb056af1fa1299168188fd8c78542a07"
    },
  }
}

Object.keys(config).forEach(chain => {
  const { lvTokens } = config[chain]
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: Object.values(lvTokens), abi: { asset: 'address:token' } })
  }
})