/**
 * CronosBet TVL adapter
 *
 * – Counts native CRO plus every ERC-20 token that can be
 *   deposited in the GamePoolUpgradeable contract, which serves
 *   as the central treasury for all games
 */

const GAME_POOL_PROXY = '0x9Cf9Bb2526e23783002bd5d774987268c2Ddc115'

async function tvl(api) {
  const tokens = await api.call({
    target: GAME_POOL_PROXY,
    abi: 'function getSupportedTokens() view returns (address[])',
  })

  return api.sumTokens({
    owner: GAME_POOL_PROXY,
    tokens: tokens,
    nativeToken: true,
  })
}

module.exports = {
  cronos: {
    tvl,
  },
  methodology:
    'TVL is calculated by summing the balances of all supported native CRO and ERC-20 tokens held by the GamePoolUpgradeable contract, which acts as the central treasury for all CronosBet games.',
  start: '2025-06-28',
  timetravel: true,
}
