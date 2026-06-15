const { get } = require("../helper/http");

const PUBLIC_TVL_URL =
  "https://wallet-staging-v2.hinkal.io/data-server/fetch-proxy-tvl";

const CHAIN_TO_ID = {
  ethereum: 1,
  optimism: 10,
  polygon: 137,
  base: 8453,
  arbitrum: 42161,
  solana: 501,
  tron: 728126428,
};

let cache;
const getLatestPublicTvlByChainId = async () => {
  if (!cache) {
    cache = (async () => {
      const { data } = await get(PUBLIC_TVL_URL);
      const latestTs = Math.max(...data.map((d) => d.timestamp));
      const byChainId = {};
      for (const row of data) {
        if (row.timestamp === latestTs) byChainId[row.chainId] = row.tvl;
      }
      return byChainId;
    })();
  }
  return cache;
};

const addPublicTvl = async (api) => {
  const chainId = CHAIN_TO_ID[api.chain];
  if (chainId === undefined) return;
  const byChainId = await getLatestPublicTvlByChainId();
  const usd = byChainId[chainId];
  if (usd > 0) api.addUSDValue(usd);
};

module.exports = { addPublicTvl };
