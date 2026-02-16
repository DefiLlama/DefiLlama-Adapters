const { sumTokens2 } = require('../helper/unwrapLPs')

const STONE_VAULT = '0xc5c6cB88598203f3652E531dbb1128Ff52F38621'
const SPARK_DAI = '0x4DEDf26112B3Ec8eC46e7E31EA5e123490B05B8B'
const AAVE_LUSD = '0x3Fe6a295459FAe07DF8A0ceCC36F37160FE86AA9'
const SCRVUSD = '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367'

async function tvl(api) {
  return sumTokens2({
    api,
    owner: STONE_VAULT,
    tokens: [SPARK_DAI, AAVE_LUSD, SCRVUSD],
  })
}

module.exports = {
  methodology:
    'TVL is calculated as the sum of yield-bearing tokens (sparkDAI, aaveLUSD, scrvUSD) held by the StoneVaultCore contract.',
  start: 1739577600, // 2025-02-15 as baseline deployment era
  ethereum: { tvl },
}
