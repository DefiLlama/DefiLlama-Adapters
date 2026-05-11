const ADDRESSES = require('../helper/coreAssets.json')
// DeFi Llama adapter for Lucky38 (randomy.fun)
// TVL = USDC balance in SharedTreasury (the single shared pool)
//
// Deploy path: projects/lucky38/index.js in DefiLlama-Adapters repo

const { sumTokens2 } = require('../helper/unwrapLPs');

const SHARED_TREASURY = '0x39CEBf6B84d37809625c2E68D0e9b2a16861379a';
const BASE_USDC        = ADDRESSES.base.USDC;

async function tvl(api) {
  return sumTokens2({
    api,
    tokens: [BASE_USDC],
    owners: [SHARED_TREASURY],
  });
}

module.exports = {
  base: { tvl },
  methodology: 'TVL equals the USDC balance held in SharedTreasury — the single liquidity pool backing all six Lucky38 games.',
};
