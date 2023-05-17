const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");
const abi = require("./abi.json");

async function getProjectInfo() {
  return await getConfig(
    "steadefi/lendingPools",
    "https://api.steadefi.com/lending-pools"
  );
}

async function tvl(_, _b, _cb, { api }) {
  const chainId = api.getChainId();
  const lendingPools = (await getProjectInfo()).filter(
    (v) => v.chainId === chainId
  );

  return sumTokens2({
    api,
    tokensAndOwners: lendingPools.map((v) => [v.baseToken.address, v.address]),
  });
}

async function borrowed(_, _b, _cb, { api }) {
  const chainId = api.getChainId();
  const lendingPools = (await getProjectInfo()).filter(
    (v) => v.chainId === chainId
  );

  const totalBorrows = await api.multiCall({
    abi: abi.totalBorrows,
    calls: lendingPools.map((v) => v.address),
  });

  lendingPools.forEach((v, i) => {
    api.add(v.baseToken.address, totalBorrows[i]);
  });
}

const chainMapping = {
  avax: "avax",
  arbitrum: "arbitrum",
};

module.exports = {};

Object.keys(chainMapping).forEach((chain) => {
  module.exports[chain] = {
    tvl,
    borrowed,
  };
});
