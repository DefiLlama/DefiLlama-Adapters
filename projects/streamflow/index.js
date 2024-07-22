const { getCache } = require('../helper/http')
const { getWhitelistedTokens } = require('../helper/streamingHelper')

const url =
  "https://metabase.internal-streamflow.com/_public/api/v1/stats/accumulated/by-token";
const chains = [
  "solana",
  "aptos",
  "bsc",
  "polygon",
  "ethereum",
  "sui",
];
const chainMapping = {
  bsc: 'bnb'
};

async function getCachedApiRespnse() {
  let apiResponse = (await getCache(url));

  return apiResponse;
}

async function fetchData(api, key, isVesting) {
  const tokenHoldings = await getCachedApiRespnse();
  const chain = (chainMapping[api.chain] || api.chain).toUpperCase();

  const holdings = tokenHoldings.filter((i) => i.chain === chain);
  let whitelistedTokens = []
  let allTokens = []
  if (key === "amount_locked_core") {
    allTokens = holdings.filter((i) => +i[key] > 0).map((i) => i.mint);
    whitelistedTokens = await getWhitelistedTokens({ api, tokens: allTokens, isVesting })
    whitelistedTokens = new Set(whitelistedTokens)
  }


  for (const tokenHolding of holdings) {
    if (key === "amount_locked_core" && !whitelistedTokens.has(tokenHolding.mint)) {
      continue;
    }
    api.add(tokenHolding.mint, tokenHolding[key]);
  }
}

async function tvl(api) {
  await fetchData(api, "amount_locked_core", false);
}

async function vesting(api) {
  await fetchData(api, "amount_locked_core", true);
  await fetchData(api, "amount_locked_vested");
}

module.exports = {
  methodology: 'Token breakdown: https://metabase.internal-streamflow.com/public/dashboard/fe3731c1-fbe4-4fb6-8960-515af1d6e72d',
  timetravel: false,
  misrepresentedTokens: false,
}

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl, vesting
  };
});
