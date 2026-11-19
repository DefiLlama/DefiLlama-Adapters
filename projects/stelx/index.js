const { staking } = require('../helper/staking')

// STELX: shielded pools on Robinhood Chain. A pool holds every deposit still inside it; its token
// set is fixed at deployment and readable from the pool itself (supportedTokens).
const POOL = '0x7005aA5deaF8433d72fdc6B56a7ccC225F51FB5C' // WETH, USDG and tokenized stocks, one anonymity set
const STELX_POOL = '0x0913A0144D5e23409334cFcADa924C7b1f4e4026' // the STELX token's own pool
const STELX = '0x7a8cda6a1cab3e5146cd13cb623a3bb284fb4ad1'

const TOKEN_COUNT = 197

async function tvl(api) {
  const tokens = await api.multiCall({
    abi: 'function supportedTokens(uint256) view returns (address)',
    target: POOL,
    calls: [...Array(TOKEN_COUNT).keys()],
  })
  return api.sumTokens({ owner: POOL, tokens: tokens })
}

module.exports = {
  methodology: 'TVL is the balance of every supported token held by the STELX shielded pool on Robinhood Chain (WETH, USDG and tokenized stocks). STELX held by the STELX token pool is counted under staking.',
  start: '2026-09-24',
  robinhood: {
    tvl,
    staking: staking(STELX_POOL, STELX),
  },
}
