const { sumERC4626VaultsExport } = require("../helper/erc4626");

const config = {
  berachain: [
    '0x59E24F42caE1B82c8b2Dc79Ea898F2F8b4986dfC',
    '0xDa785861aa6fd80D1388F65693Cd62D8a1E2956a',
    '0xf0d94806e6E5cB54336ED0f8De459659718F149C',
    '0xAEbeCae444ac70AbA0385feC4cb11eb26a12C92B',
  ]
}

Object.keys(config).forEach(chain => {
  const vaults = config[chain]
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults, isOG4626: true, })
  }
})

module.exports.doublecounted = true