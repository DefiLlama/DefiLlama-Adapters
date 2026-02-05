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
 * Dynamically fetch all strategy addresses from Voter contract
 */
async function getStrategies(api) {
  const strategies = [];
  let index = 0;
  const maxStrategies = 20;

  while (index < maxStrategies) {
    const strategy = await api.call({
      abi: "function strategies(uint256) view returns (address)",
      target: VOTER,
      params: [index],
      permitFailure: true,
    });
    if (strategy && strategy !== "0x0000000000000000000000000000000000000000") {
      strategies.push(strategy);
      index++;
    } else {
      break;
    }
  }

  return strategies;
}

/**
 * Dynamically discover tokens from strategies
 */
async function discoverTokens(api, strategies) {
  const tokens = new Set(BASE_TOKENS.map(t => t.toLowerCase()));

  for (const strategy of strategies) {
    const paymentToken = await api.call({
      abi: "function paymentToken() view returns (address)",
      target: strategy,
      permitFailure: true
    });
    if (paymentToken && paymentToken !== "0x0000000000000000000000000000000000000000") {
      tokens.add(paymentToken.toLowerCase());
    }

    const buybackToken = await api.call({
      abi: "function buybackToken() view returns (address)",
      target: strategy,
    permitFailure: true
    });
    if (buybackToken && buybackToken !== "0x0000000000000000000000000000000000000000") {
      tokens.add(buybackToken.toLowerCase());
    }
  }

  return Array.from(tokens);
}

/**
 * TVL: Track ALL assets in Treasury + WETH in operational contracts
 */
async function tvl(api) {
  const strategies = await getStrategies(api);
  const allTokens = await discoverTokens(api, strategies);

  // Track all tokens in Treasury (including DONUT and LP acquired via governance)
  await sumTokens2({
    api,
    owners: [TREASURY],
    tokens: allTokens,
    resolveLP: true,
    blacklistedTokens: [LP_TOKEN, DONUT_TOKEN],
  });

  // Track WETH in operational contracts
  await sumTokens2({
    api,
    owners: [VOTER, REVENUE_ROUTER, ...strategies],
    tokens: [WETH],
  });
}

/**
 * Staking: Track DONUT staked in GovernanceToken contract
 */
async function staking(api) {
  await sumTokens2({
    api,
    owners: [GOVERNANCE_TOKEN, TREASURY],
    tokens: [DONUT_TOKEN],
  });
}

async function pool2(api) {
  await sumTokens2({
    api,
    owners: [TREASURY],
    tokens: [LP_TOKEN],
    resolveLP: true,
  });
}

module.exports = {
  base: {
    tvl,
    pool2,
    staking,
  },
};