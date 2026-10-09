const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const PRE_GENESIS_FARM = '0x58711b4AA9cc0730b3602C29299f6cfCA23b6337'
const SHYT = '0x0105Bf7d7e7d883145806a1e5664470Ee2d1518e'

async function tvl(api) {
  const tokens = await api.fetchList({ target: PRE_GENESIS_FARM, lengthAbi: 'poolCount', itemAbi: 'function pools(uint256) view returns (address token)' })
  return sumTokens2({ api, owner: PRE_GENESIS_FARM, tokens, blacklistedTokens: [SHYT] })
}

module.exports = {
  methodology: 'TVL is the value of ERC-20 assets deposited into Holi Pre-Genesis Farm on Robinhood Chain. SHYT deposits are counted under staking.',
  start: '2026-09-29',
  robinhood: {
    tvl,
    staking: staking(PRE_GENESIS_FARM, SHYT),
  },
}
