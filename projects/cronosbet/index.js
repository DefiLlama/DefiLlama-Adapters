/**
 * CronosBet TVL adapter
 *
 * – Counts native CRO plus every ERC-20 token that can be
 *   deposited in the GamePoolUpgradeable contract, which serves
 *   as the central treasury for all games
 */

const { sumTokens2, nullAddress } = require("../helper/unwrapLPs")

const GAME_POOL = '0xdF697B906AE26a5dB263517c3d1CAf52d19bD8Ac'

async function tvl(api) {
  // Get supported ERC-20 tokens from the tokenList array
  const tokens = await api.fetchList({ lengthAbi: 'getSupportedTokensLength', itemAbi: 'tokenList', target: GAME_POOL, })
  tokens.push(nullAddress)
  return sumTokens2({ owner: GAME_POOL, tokens, api })
}

module.exports = {
  cronos: { tvl, },
  methodology: 'Value of tokens in the game pool contract',
  start: '2025-06-28',
}
