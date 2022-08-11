// Adding TVL from magik.farm
// 1. Loop through the pools in ./config/vault
// 1a. *_pools.js files need to be updated when new pools are created
// 2. Exclude staking and pool2 vaults from the tvl as they are already added in the staking and pool2 fields (in fantom)
// 3. Aggregate the tvl by each chain (defined in the networkMapping variable)

const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const { tombTvl } = require("../helper/tomb");
const { toUSDTBalances } = require("../helper/balances");

const magik = "0x87a5c9b60a3aaf1064006fe64285018e50e0d020";
const mshare = "0xc8ca9026ad0882133ef126824f6852567c571a4e";
const masonry = "0xac55a55676657d793d965ffa1ccc550b95535634";
const rewardPool = "0x38f006eb9c6778d02351fbd5966f829e7c4445d7";
const pool2LPs = [
  "0xdc71a6160322ad78dab0abb47c7a581cfe9709ee",
  "0x392c85ceccf9855986b0044a365a5532aec6fa31",
];
const magikConfig = require("./config");
const networkMapping = {
  10: {
    name: "optimism",
    multiCallChainName: "optimism",
    pools: magikConfig.arbitrumPools,
  },
  43114: {
    name: "avalanche",
    multiCallChainName: "avax",
    pools: magikConfig.avalanchePools,
  },
  1666600000: {
    name: "harmony",
    multiCallChainName: "harmony",
    pools: magikConfig.harmonyPools,
  },
  42220: {
    name: "celo",
    multiCallChainName: "celo",
    pools: magikConfig.celoPools,
  },
  42161: {
    name: "arbitrum",
    multiCallChainName: "arbitrum",
    pools: magikConfig.arbitrumPools,
  },
  1285: {
    name: "moonriver",
    multiCallChainName: "moonriver",
    pools: magikConfig.moonriverPools,
  },
  1088: {
    name: "metis",
    multiCallChainName: "metis",
    pools: [],
  },
  250: {
    name: "fantom",
    multiCallChainName: "fantom",
    pools: magikConfig.fantomPools,
  },
  137: {
    name: "polygon",
    multiCallChainName: "polygon",
    pools: magikConfig.polygonPools,
  },
  128: {
    name: "heco",
    multiCallChainName: "heco",
    pools: magikConfig.hecoPools,
  },
  122: {
    name: "fuse",
    multiCallChainName: "fuse",
    pools: [],
  },
  56: {
    name: "binance",
    multiCallChainName: "bsc",
    pools: magikConfig.bscPools,
  },
  25: {
    name: "cronos",
    multiCallChainName: "cronos",
    pools: magikConfig.cronosPools,
  },
  1313161554: {
    name: "aurora",
    multiCallChainName: "aurora",
    pools: magikConfig.auroraPools,
  },
};
const balanceAbi = {
  constant: true,
  inputs: [],
  name: "balance",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function",
};

// Time-based cache buster
const getApiCacheBuster = () => {
  return Math.trunc(Date.now() / (1000 * 60));
};
const urlLpPrices = "https://magikfarm.herokuapp.com/lps";
const urlTokenPrices = "https://magikfarm.herokuapp.com/prices";

function removeStakingPools(pools) {
  return pools.filter((pool) => {
    return pool.tokenAddress.toLowerCase() != magik.toLowerCase();
  });
}

function removePool2(pools) {
  // normalize address to lowercase for comparison
  const pool2LpLower = pool2LPs.map((pool) => {
    return pool.toLowerCase();
  });
  return pools.filter((pool) => {
    return pool2LpLower.indexOf(pool.tokenAddress.toLowerCase()) === -1;
  });
}

function removeStakingAndPool2(pools) {
  pools = removeStakingPools(pools);
  pools = removePool2(pools);
  return pools;
}

function fetchChain(chain) {
  return async () => {
    let chainTvl = 0;
    const queryParams = `_=${getApiCacheBuster()}`;
    const lpUrl = `${urlLpPrices}?${queryParams}`;
    const tokenPriceUrl = `${urlTokenPrices}?${queryParams}`;
    const lpPriceResults = await utils.fetchURL(lpUrl);
    const tokenPriceResults = await utils.fetchURL(tokenPriceUrl);
    const lpPriceData = lpPriceResults.data;
    const tokenPriceData = tokenPriceResults.data;
    let pools = chain.pools && chain.pools.length > 0 ? chain.pools : 0;
    const rpcKey = `${chain.multiCallChainName.toUpperCase()}_RPC`;
    const rpcUrl = process.env[rpcKey];
    if (rpcUrl != "" && pools.length > 0) {
      // remove pool2 and staking pools in fantom
      if (chain.name === "fantom") {
        pools = removeStakingAndPool2(pools);
      }
      const vaultCalls = pools.map((pool) => {
        return {
          target: pool.earnedTokenAddress,
        };
      });
      const vaultResult = await sdk.api.abi.multiCall({
        abi: balanceAbi,
        calls: vaultCalls,
        chain: chain.multiCallChainName.toLowerCase(),
      });
      for (let i = 0; i < pools.length; i++) {
        const pool = pools[i];
        let price = null;
        switch (pool.stratType) {
          case "StratLP":
            price = lpPriceData[pool.oracleId];
            break;
          case "SingleStake":
            price = tokenPriceData[pool.oracleId];
        }
        const tokenDecimals = pool.tokenDecimals;
        const balance = Number(vaultResult.output[i].output);
        if (!isNaN(price) && !isNaN(tokenDecimals) && !isNaN(balance)) {
          chainTvl += (balance / Math.pow(10, tokenDecimals)) * price;
        }
      }
    }
    return toUSDTBalances(chainTvl);
  };
}

function fetchTomb() {
  const tombData = tombTvl(
    magik,
    mshare,
    rewardPool,
    masonry,
    pool2LPs,
    "fantom",
    undefined,
    false,
    pool2LPs[1]
  );
  const fantom = tombData.fantom;
  const staking = fantom.staking;
  const pool2 = tombData.fantom.pool2;
  return { staking, pool2 };
}

module.exports = {
  misrepresentedTokens: true,
  ...Object.fromEntries(
    Object.keys(networkMapping)
      .filter((chainId) => {
        const chain = networkMapping[chainId];
        const pools = chain.pools && chain.pools.length > 0 ? chain.pools : 0;
        return pools.length > 0;
      })
      .map((chainId) => {
        const chain = networkMapping[chainId];
        if (chain.name === "fantom") {
          const { staking, pool2 } = fetchTomb();
          return [
            chain.multiCallChainName,
            {
              tvl: fetchChain(chain),
              staking: staking,
              pool2: pool2,
            },
          ];
        } else {
          return [chain.multiCallChainName, { tvl: fetchChain(chain) }];
        }
      })
  ),
};
