const { sumERC4626VaultsExport } = require('../helper/erc4626')

const config = {
  scroll: {
    vaults: {
      WSTETH: '0xd3b2AffE1e406D0d8D15Ce8CFb937D305f2680Bb',
      RETH: '0x20b3a538aA525Cf5F8aF25052AE849471d96138B',
      WETH: '0xA5832adC1e4487B635a483722e4fc34062467479',
    }
  },
}

Object.keys(config).forEach(chain => {
  const { vaults } = config[chain]
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: Object.values(vaults) })
  }
})
