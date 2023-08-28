// Adding TVL from magik.farm
// 1. Loop through the pools in ./config/vault
// 1a. *_pools.js files need to be updated when new pools are created
// 2. Exclude staking and pool2 vaults from the tvl (in fantom)
// 3. Aggregate the tvl by each chain (defined in the networkMapping variable)
// calcaulte tvl for staking
// 1. Use getStakingPools() to get only the staking LPs
// 2. Aggregate the tvl for each chain (only fantom for now)
// calcaulte tvl for pool2
// 1. Use getPool2() to get only the pool2 Lps
// 2. Aggregate the tvl for each chain (only fantom for now)

const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const { toUSDTBalances } = require("../helper/balances");

const magik = "0x87a5c9b60a3aaf1064006fe64285018e50e0d020";
const mshare = "0xc8ca9026ad0882133ef126824f6852567c571a4e";
const pool2LPs = [
  "0xDc71A6160322ad78DaB0abb47C7A581cFE9709Ee", //magik-ftm spirit LP
  "0x392C85cECcf9855986b0044a365A5532aeC6Fa31", //mshare-ftm spirit LP
  "0x4d6b28441c8B293A603243431E6E31F3C2632ddD", //mshare-ftm spirit LP
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
const balanceAbi = "uint256:balance"

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

function getStakingPools(pools) {
  return pools.filter((pool) => {
    return pool.tokenAddress.toLowerCase() == magik.toLowerCase();
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

function getPool2(pools) {
  // normalize address to lowercase for comparison
  const pool2LpLower = pool2LPs.map((pool) => {
    return pool.toLowerCase();
  });
  return pools.filter((pool) => {
    return pool2LpLower.indexOf(pool.tokenAddress.toLowerCase()) > -1;
  });
}

function removeStakingAndPool2(pools) {
  pools = removeStakingPools(pools);
  pools = removePool2(pools);
  return pools;
}

function fetchChain(chain, pools) {
  return async () => {
    let chainTvl = 0;
    const queryParams = `_=${getApiCacheBuster()}`;
    const lpUrl = `${urlLpPrices}?${queryParams}`;
    const tokenPriceUrl = `${urlTokenPrices}?${queryParams}`;
    const lpPriceResults = await utils.fetchURL(lpUrl);
    const tokenPriceResults = await utils.fetchURL(tokenPriceUrl);
    const lpPriceData = lpPriceResults.data;
    const tokenPriceData = tokenPriceResults.data;
    if (pools.length > 0) {
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
        let pools = chain.pools && chain.pools.length > 0 ? chain.pools : 0;
        const stakingPools = getStakingPools(pools);
        const pool2 = getPool2(pools);
        // if current chain has staking or pool2 pools separate them out
        if (stakingPools.length > 0 || pool2.length > 0) {
          // remove pool2 and staking pools
          const removedPools = removeStakingAndPool2(pools);
          return [
            chain.multiCallChainName,
            {
              tvl: fetchChain(chain, removedPools),
              staking: fetchChain(chain, stakingPools),
              pool2: fetchChain(chain, pool2),
            },
          ];
        } else {
          return [chain.multiCallChainName, { tvl: fetchChain(chain, pools) }];
        }
      })
  ),
};
