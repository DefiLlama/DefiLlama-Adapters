const { ventureTvl, ventureStaking } = require('../helper/umia')

const UMIA_VENTURE_ID = 7

module.exports = {
  methodology:
    "Canonical spot liquidity held by the UMIA SpotLiquidityVault -- its Uniswap v4 pool reserves, idle balances and any amount on loan to a live decision market -- plus the real money users have escrowed in that venture's live decision market through `split`. Counted in the venture's money token (USDC) only: UMIA is the platform's own token, which DefiLlama keeps out of TVL. The vault is the pool's only permitted liquidity operator by design, so it holds 100% of canonical liquidity. Staking is the UMIA staked to open a decision market.",
  start: '2026-09-02',
  hallmarks: [['2026-09-02', 'Migration, spot pool live']],
  base: {
    tvl: ventureTvl(UMIA_VENTURE_ID),
    staking: ventureStaking(UMIA_VENTURE_ID),
  },
}
