const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

// Fantom-style Special Fee Contract — holds validator self-stake + delegations.
const SFC = '0xFC00FACE00000000000000000000000000000000'

const tvl = sumTokensExport({
  owners: [SFC],
  tokens: [nullAddress],
})

module.exports = {
  methodology:
    'Counts native DLY locked in the SFC staking contract (validator self-stake and delegations) on Daily Network mainnet (chain 824) and testnet (chain 825).',
  dly: { tvl },
  tdly: { tvl },
}
