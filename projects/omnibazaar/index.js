/**
 * DeFiLlama TVL adapter for OmniBazaar — Early LP program.
 *
 * TVL model: XOM/USDC AMM LP tokens staked in the protocol's
 * LiquidityOverflowPool on each chain, unwrapped to underlying reserves
 * by the DeFiLlama SDK (`resolveLP: true`). Because one side of the pair
 * is the platform's own token (XOM), the staked LP is exported as
 * `pool2` per DeFiLlama's classification rules
 * (https://docs.llama.fi/list-your-project/what-to-include-as-tvl);
 * the core `tvl` export is intentionally empty.
 *
 * OmniBazaar also runs its own L1 (OmniCoin, chainId 88008, an Avalanche
 * subnet) holding additional staked LP; that chain is not yet in the
 * DeFiLlama chain registry, so it is excluded here and will follow in a
 * separate add-chain PR.
 */

const { sumTokensExport } = require('../helper/unwrapLPs')

// LiquidityOverflowPool (staking contract holding user LP) per chain.
// CREATE2 deterministic deploys mean some addresses repeat across
// chains — that is intentional.
const OVERFLOW_POOL = {
  ethereum: '0x4F1CbE46d42e2F880aE1aE8c091c9BA365bC0B33',
  arbitrum: '0x9D4C97BF6C8064D32e8Fa9DEC5364ff2dC01aB7f',
  base: '0xdB993473060739a523c5c3fdDCf8705BaF84a1DF',
  polygon: '0xdB993473060739a523c5c3fdDCf8705BaF84a1DF',
}

// XOM/USDC pool contract — the pool IS the LP token (UniV2-style
// getReserves/token0/token1/totalSupply surface).
const LP_TOKEN = {
  ethereum: '0x425DF6b845F24f96CBAf308B167A1a458102F648',
  arbitrum: '0xb9b602d51e411cf9D65bD2CFF0528Fe8B8f484b2',
  base: '0x8Bf4142F6C1B3F9938390658E1a73CC49139e336',
  polygon: '0x8Bf4142F6C1B3F9938390658E1a73CC49139e336',
}

/** Core TVL is intentionally empty — all value is own-token pool2. */
async function tvl() {
  return {}
}

function chainExport(chain) {
  return {
    tvl,
    pool2: sumTokensExport({
      owner: OVERFLOW_POOL[chain],
      tokens: [LP_TOKEN[chain]],
      resolveLP: true,
    }),
  }
}

module.exports = {
  methodology:
    'Pool2 = XOM/USDC AMM LP tokens staked in the LiquidityOverflowPool ' +
    'contract on each chain, resolved to underlying XOM + USDC reserves. ' +
    'Core TVL is empty because all protocol liquidity pairs the native ' +
    'token (XOM) — counted as pool2 per DeFiLlama classification.',
  ethereum: chainExport('ethereum'),
  arbitrum: chainExport('arbitrum'),
  base: chainExport('base'),
  polygon: chainExport('polygon'),
}
