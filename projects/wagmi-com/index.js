const { uniV3Export } = require("../helper/uniswapV3");
const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { request } = require("graphql-request");
const { ethers } = require("ethers");

const {
  chainId,
  chainNames,
  SWAGMI_ADDRESSES,
  SWAGMI_GRAPH,
  WAGMI_ADDRESSES,
  WAGMI_GRAPH,
  query,
  poolQuery,
  sWagmiSupportedChains,
} = require("./constants");

const NOW = Math.floor(Date.now() / 1000);
const LAST_MONTH = 30 * 24 * 60 * 60; // 30 days
const START_TIMESTAMP = Math.floor(NOW - LAST_MONTH);

const config = uniV3Export({
  [chainId.era]: {
    factory: "0x31be61CE896e8770B21e7A1CAFA28402Dd701995",
    fromBlock: 1351075,
  },
  [chainId.fantom]: {
    factory: "0xaf20f5f19698f1D19351028cd7103B63D30DE7d7",
    fromBlock: 60063058,
  },
  [chainId.ethereum]: {
    factory: "0xB9a14EE1cd3417f3AcC988F61650895151abde24",
    fromBlock: 18240112,
  },
  [chainId.metis]: {
    factory: "0x8112E18a34b63964388a3B2984037d6a2EFE5B8A",
    fromBlock: 9740222,
  },
  // kava: {
  //   factory: "0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B",
  //   fromBlock: 6037137,
  // },
});

async function getKava(api) {
  const pools = await cachedGraphQuery(
    "wagmi-kava",
    WAGMI_GRAPH[chainId.kava],
    poolQuery,
    { api, useBlock: false, fetchById: true }
  );

  const ownerTokens = pools.map((i) => [[i.token0.id, i.token1.id], i.id]);

  return await sumTokens2({ api, ownerTokens, blacklistedTokens: [] });
}

async function getTVL(api, chain) {
  let balances = {};

  if (chain === chainId.kava) {
    balances = await getKava(api);
  } else {
    balances = await config[chain].tvl(api);
  }

  if (sWagmiSupportedChains.includes(chain)) {
    const chainName = chainNames[chain];
    const graphUrl = SWAGMI_GRAPH[chain];

    const { sWagmiDayDatas } = await request(graphUrl, query, {
      startTimestamp: START_TIMESTAMP,
      endTimestamp: NOW,
    });

    const lastData = sWagmiDayDatas[sWagmiDayDatas.length - 1].totalValueLocked;
    const sWagmiData = ethers
      .parseUnits(parseFloat(lastData).toFixed(18), 18)
      .toString();

    balances[`${chainName}:${SWAGMI_ADDRESSES[chain]}`] = sWagmiData;

    const regularWagmiBalance =
      balances[`${chainName}:${WAGMI_ADDRESSES[chain]}`];
    const swagmiBalance = balances[`${chainName}:${SWAGMI_ADDRESSES[chain]}`];

    const wagmiBalance = (
      BigInt(regularWagmiBalance) + BigInt(swagmiBalance)
    ).toString();

    balances[`${chainName}:${WAGMI_ADDRESSES[chain]}`] = wagmiBalance;
  }

  return balances;
}

// module.exports.kava = { tvl: uniV3GraphExport({ name: 'wagmi-kava', graphURL: 'https://kava.graph.wagmi.com/subgraphs/name/v3', minTVLUSD: 0 }) }

module.exports = {
  kava: {
    tvl: (api) => getTVL(api, chainId.kava),
  },
  metis: {
    tvl: (api) => getTVL(api, chainId.metis),
  },
  era: {
    tvl: (api) => getTVL(api, chainId.era),
  },
  fantom: {
    tvl: (api) => getTVL(api, chainId.fantom),
  },
  ethereum: {
    tvl: (api) => getTVL(api, chainId.ethereum),
  },
};
