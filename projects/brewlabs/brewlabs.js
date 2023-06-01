const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require("../helper/balances");
const utils = require("../helper/utils");

const api_endpoint = "https://api.nodes-brewlabs.info/api";
const blacklist = [
  "0x2f6ad7743924b1901a0771746152dde44c5f11de",
  "0xfd6bc48f68136e7bf4ae1fb4b0c2e6911a50e18b",
  "0xafbb5dafacea3cfe1001357449e2ea268e50f368",
  "0x7db5af2b9624e1b3b4bb69d6debd9ad1016a58ac",
];

const chains = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  cronos: 25,
  fantom: 250,
  avax: 43114,
  bitgert: 32520,
};

const getpricesMapId = (chain, type, address) =>
  `c${chain}_${type}${address.toLowerCase()}`;

async function calcTvl(network, staking) {
  const data = { chainId: network };

  const poolsResult = await utils.postURL(`${api_endpoint}/pools`, data);
  const farmsResult = await utils.postURL(`${api_endpoint}/farms`, data);
  const pricesResult = await utils.fetchURL(`${api_endpoint}/prices`);

  let totalValueLocked = 0;
  for (const pool of poolsResult.data) {
    if (blacklist.includes(pool.stakingToken.address.toLowerCase())) continue;
    if (pool.chainId !== network) continue;
    if (staking && pool.stakingToken.symbol !== "BREWLABS") continue;

    const chainId = pool.chainId;
    const totalStaked = pool.totalStaked;
    const index = getpricesMapId(chainId, "t", pool.stakingToken.address);
    const price = pricesResult.data.tokenPrices[index];

    totalValueLocked += price ? price * totalStaked : 0;
  }

  for (const farm of farmsResult.data) {
    if (blacklist.includes(farm.lpAddress.toLowerCase())) continue;
    if (farm.chainId !== network) continue;
    if (staking && !farm.lpSymbol.includes("BREWLABS")) continue;

    const chainId = farm.chainId;
    const totalStaked = farm.totalStaked;
    const index = getpricesMapId(chainId, "l", farm.lpAddress);
    const price = pricesResult.data.lpPrices[index];

    totalValueLocked += price ? price * totalStaked : 0;
  }
  return toUSDTBalances(totalValueLocked);
}

function fetchChain(chain, staking) {
  return async () => {
    const tvl = await calcTvl(chains[chain], staking);
    return tvl;
  };
}

module.exports = {
  fetchChain,
};
