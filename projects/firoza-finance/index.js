const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { get } = require("../helper/http");

const erc4626Abi = require("./erc4626.json");

const POOL_API_URL = "https://firoza.finance/api/pools";

async function fetchPoolAddresses() {
  try {
    const poolAddresses = await get(POOL_API_URL);
    return poolAddresses;
  } catch (error) {
    console.error("Error fetching pool addresses:", error);
    return null;
  }
}


async function tvl(timestamp, block, chainBlocks, { api }) {
  const poolAddresses = await fetchPoolAddresses();

  const [tokens, balances] = await Promise.all([
    api.multiCall({ abi: erc4626Abi.asset, calls: poolAddresses }),
    api.multiCall({ abi: erc4626Abi.totalAssets, calls: poolAddresses }),
  ]);

  const balancesMap = {};
  tokens.forEach((token, i) => {
    const balance = BigNumber(balances[i] || 0);
    if (balance.gt(0)) {
      balancesMap[token] = (balancesMap[token] || BigNumber(0)).plus(balance);
    }
  });

  Object.entries(balancesMap).forEach(([token, balance]) => {
    api.add(token, balance.toString());
  });

  return api.getBalances();
}

module.exports = {
  methodology: "TVL counts the tokens deposited in the Firoza Finance pools.",
  islm: { tvl },
  hallmarks: [
    [1688169600, "Launch on ISLM"]
  ],
};