const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const REWARD_VAULT = '0xE54c8d7b6FC69223E22479Af432C4F81D78A27eF'

module.exports = {
  methodology: 'Cronos-only TVL. Counts assets custodied by NeuroIsland RewardVault on Cronos: native CRO and CRC-20 token balances held by the vault contract. Solana contracts/integrations are out of scope. Non-custodial soft-staking and off-chain accounting are excluded.',
  cronos: {
    tvl: sumTokensExport({
      owner: REWARD_VAULT,
      tokens: [ADDRESSES.null],
    }),
  },
}
