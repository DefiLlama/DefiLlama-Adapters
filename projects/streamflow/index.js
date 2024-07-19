const { getCache } = require('../helper/http')

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

async function fetchData(api, key) {
  const tokenHoldings = await getCachedApiRespnse();
  const chain = (chainMapping[api.chain] || api.chain).toUpperCase();

  const mints = [];
  const balances = [];

  for (const tokenHolding of tokenHoldings) {
    if (tokenHolding.chain === chain) {
      mints.push(tokenHolding.mint);
      balances.push(tokenHolding[key]);
    }
  }

  api.addTokens(mints, balances);
}

async function tvl(api) {
  await fetchData(api, "amount_locked_core");
}

async function vesting(api) {
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
