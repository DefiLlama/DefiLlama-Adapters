const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Core contract addresses
const DONUT_TOKEN = "0xAE4a37d554C6D6F3E398546d8566B25052e0169C";
const LP_TOKEN = "0xD1DbB2E56533C55C3A637D13C53aeEf65c5D5703";
const GOVERNANCE_TOKEN = "0xC78B6e362cB0f48b59E573dfe7C99d92153a16d3"; // gDONUT - holds staked DONUT
const VOTER = "0x9C5Cf3246d7142cdAeBBD5f653d95ACB73DdabA6";
const REVENUE_ROUTER = "0x4cDF668bFa0563C9D0fc5D5bD33191f0a2aE2571";
const TREASURY = "0x690C2e187c8254a887B35C0B4477ce6787F92855";

// Base chain tokens
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const CBBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";

// Base tokens that could be acquired by treasury
// This list is checked + any tokens discovered from strategies
const BASE_TOKENS = [WETH, USDC, CBBTC, DONUT_TOKEN, LP_TOKEN];

/**
 * TVL: Track ALL assets in Treasury + WETH in operational contracts
 */
async function tvl(api) {
  const strategies = await api.fetchList({ lengthAbi: 'length', itemAbi: 'strategies', target: VOTER })
  const paymentTokens = await api.multiCall({ abi: 'address:paymentToken', calls: strategies })
  const tokens = BASE_TOKENS.concat(paymentTokens)

  // Track all tokens in Treasury (including DONUT and LP acquired via governance)
  await sumTokens2({
    api,
    owners: [TREASURY],
    tokens,
    resolveLP: true,
    blacklistedTokens: [DONUT_TOKEN],
  });

  // Track WETH in operational contracts
  await sumTokens2({
    api,
    owners: [VOTER, REVENUE_ROUTER, ...strategies],
    tokens: [WETH],
  });
}

module.exports = {
  base: {
    tvl,
    staking: staking([GOVERNANCE_TOKEN, TREASURY], DONUT_TOKEN),
  },
};