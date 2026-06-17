const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const owners = [
  '0xE54c8d7b6FC69223E22479Af432C4F81D78A27eF', // Reward Vault
  '0xDeb77dAf2A427Fee514CE53143e407276BBf1F45', // NeuroBeat
]

module.exports = {
  methodology: 'Counts assets custodied by NeuroIsland RewardVault and NeuroBeat game contract on Cronos: native CRO and CRC-20 token balances held by the contracts.',
  cronos: {
    tvl: sumTokensExport({
      owners,
      tokens: [ADDRESSES.null],
    }),
  },
}
