const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require("@defillama/sdk");
const { invokeViewFunction, rpcURL } = require("../helper/chain/supra");
const { transformBalances } = require("../helper/portedTokens");
const { post } = require("../helper/http");

const ATMOS_MODULE_ADDRESS = "0xa4a4a31116e114bf3c4f4728914e6b43db73279a4421b0768993e07248fe2234";
const GET_POOLS_PAGED = `${ATMOS_MODULE_ADDRESS}::liquidity_pool::get_pools_map_paged`;
const SIMULATE_SWAP_WEIGHTED = `${ATMOS_MODULE_ADDRESS}::liquidity_pool::simulate_swap_exact_in_weighted`;
const SIMULATE_SWAP_STABLE = `${ATMOS_MODULE_ADDRESS}::liquidity_pool::simulate_swap_exact_in_stable`;

const POOL_TYPE = {
  STABLE: 100,
  WEIGHTED: 101,
};

const TOKENS = {
  SUPRA: ADDRESSES.supra.SUPRA,
  SUPRA_FA: "0xa",
  DEX_USDC: ADDRESSES.supra.dexUSDC,
  DEX_USDC_FA: "0xbb3c1ca1ef67b1a994f2463978695c7bf890710182f75edef05ad08490be3658",
  CASH: "0x9176f70f125199a3e3d5549ce795a8e906eed75901d535ded623802f15ae3637::cdp_multi::CASH",
  CASH_FA: "0x4b28b64c9fa2e5a10f8fb57f1df741f40f58d1eafcfb6ae7c6cfbc68c83d32f7",
  SOLID: "0xaa925a2232144c11dfe855178e1d252a8d0d4f51f5572fc0ec34efa6333952ae",
  TPC: "0x99f84c4fda663bf3baf3a1b0980386ca084c3e9340a4d3f8713cd54ec85f4cea",
  SUP_USDC: "0xf90b4b9d4a9d87c39fb3140513e52edc3ead5eaddcb9881b02becdeb63c5793d",
  I_USDC: "0x90a8e901e02ac1539af4a865bbe4a6b96edc27375488803cfbbd6875ec57b281",
  I_SUPRA: "0x80f0251b74c76f1c477b9209ade65ffb5cfecd9b259875c3865ad645f6c33a3d"
};

const PRICE_POOLS = {
  CASH: "0x8eae6fc4c7dbb3f9717a0ba6771a0359ca095a8ab99815e899a2b97093963416",
  SOLID: "0x4c7a3828c0da5e49e363b955b30c25a8944f36f27f637fd24a457f13eebefef2",
  TPC: "0x5235d477677a6c5f18f98250fa3f27d3ca81885d2ed9affd4049973379d213d6",
  SUP_USDC: "0x4274ed3b66bee46d049d6217ea005438aef6599674eeb37b77b19aa7a0a91acd",
  I_USDC: "0xc3b2811077b309e2d6e7014e4b427d0e37377b9a86592d95ee97471cdb8e59af",
  I_SUPRA: "0x35981f390ac0d7c089c14b156ec0f53c4fe74e0c3342b590110b325c580e7388",
};

const ONE_TOKEN_DECIMALS = {
  CASH: 100000000n, // 1e8
  SOLID: 100000000n, // 1e8
  TPC: 1000000n, // 1e6
  SUP_USDC: 1000000n, // 1e6
  I_USDC: 100000000n, // 1e8
  I_SUPRA: 100000000n, // 1e8
};

const FA_TO_COIN = {
  [TOKENS.SUPRA_FA]: TOKENS.SUPRA,
  [TOKENS.DEX_USDC_FA]: TOKENS.DEX_USDC,
  [TOKENS.CASH_FA]: TOKENS.CASH,
};

const CORE_ASSETS = [TOKENS.SUPRA, TOKENS.DEX_USDC, TOKENS.CASH, TOKENS.SOLID, TOKENS.TPC, TOKENS.SUP_USDC, TOKENS.I_USDC, TOKENS.I_SUPRA];

const isCoreAsset = (coin) => CORE_ASSETS.includes(coin);

async function getAllPools() {
  const pools = [];
  let bucketIdx = "0";
  let vectorIdx = "0";
  const pageSize = "200";

  while (true) {
    const response = await post(`${rpcURL()}/rpc/v3/view`, {
      function: GET_POOLS_PAGED,
      arguments: [bucketIdx, vectorIdx, pageSize],
      type_arguments: [],
    });

    const result = response.result;
    if (result?.[0]?.data) {
      pools.push(...result[0].data);
    }

    const nextBucketIdx = result[1]?.vec?.[0];
    const nextVectorIdx = result[2]?.vec?.[0];

    if (!nextBucketIdx && !nextVectorIdx) break;

    bucketIdx = nextBucketIdx;
    vectorIdx = nextVectorIdx;
  }

  return pools;
}

async function getTokenPriceInSupra(poolAddress, tokenFA, amount, poolType = POOL_TYPE.WEIGHTED) {
  const result = await invokeViewFunction(poolType === POOL_TYPE.WEIGHTED ? SIMULATE_SWAP_WEIGHTED : SIMULATE_SWAP_STABLE, [], [
    poolAddress,
    tokenFA,
    TOKENS.SUPRA_FA,
    amount,
    { vec: [] },
  ]);
  return BigInt(result[0].amount_out);
}

async function fetchTokenPrices() {
  const [cashPrice, solidPrice, tpcPrice, supUsdcPrice, iUsdcPrice, iSupraPrice] = await Promise.all([
    getTokenPriceInSupra(PRICE_POOLS.CASH, TOKENS.CASH_FA, ONE_TOKEN_DECIMALS.CASH.toString()),
    getTokenPriceInSupra(PRICE_POOLS.SOLID, TOKENS.SOLID, ONE_TOKEN_DECIMALS.SOLID.toString()),
    getTokenPriceInSupra(PRICE_POOLS.TPC, TOKENS.TPC, ONE_TOKEN_DECIMALS.TPC.toString()),
    getTokenPriceInSupra(PRICE_POOLS.SUP_USDC, TOKENS.SUP_USDC, ONE_TOKEN_DECIMALS.SUP_USDC.toString()),
    getTokenPriceInSupra(PRICE_POOLS.I_USDC, TOKENS.I_USDC, ONE_TOKEN_DECIMALS.I_USDC.toString()),
    getTokenPriceInSupra(PRICE_POOLS.I_SUPRA, TOKENS.I_SUPRA, ONE_TOKEN_DECIMALS.I_SUPRA.toString(), POOL_TYPE.STABLE),
  ]);

  return { cashPrice, solidPrice, tpcPrice, supUsdcPrice, iUsdcPrice, iSupraPrice };
}

function getAssetWeight(pool, assetIndex, numAssets) {
  const poolType = Number(pool.pool_type);
  const weights = pool.weights?.map(Number);

  if (poolType === POOL_TYPE.STABLE) {
    return 100 / numAssets;
  }

  if (poolType === POOL_TYPE.WEIGHTED && weights?.[assetIndex]) {
    return weights[assetIndex];
  }

  return 100 / numAssets;
}

function convertToSupra(coin, balance, prices) {
  if (coin === TOKENS.CASH) {
    return (balance * prices.cashPrice) / ONE_TOKEN_DECIMALS.CASH;
  }
  if (coin === TOKENS.SOLID) {
    return (balance * prices.solidPrice) / ONE_TOKEN_DECIMALS.SOLID;
  }
  if (coin === TOKENS.TPC) {
    return (balance * prices.tpcPrice) / ONE_TOKEN_DECIMALS.TPC;
  }
  if (coin === TOKENS.SUP_USDC) {
    return (balance * prices.supUsdcPrice) / ONE_TOKEN_DECIMALS.SUP_USDC;
  }
  if (coin === TOKENS.I_USDC) {
    return (balance * prices.iUsdcPrice) / ONE_TOKEN_DECIMALS.I_USDC;
  }
  if (coin === TOKENS.I_SUPRA) {
    return (balance * prices.iSupraPrice) / ONE_TOKEN_DECIMALS.I_SUPRA;
  }
  return 0n;
}

function addToBalances(balances, coin, amount, prices) {
  if (amount <= 0n) return;

  if (coin === TOKENS.SUPRA || coin === TOKENS.DEX_USDC) {
    sdk.util.sumSingleBalance(balances, coin, amount.toString());
  } else {
    const supraAmount = convertToSupra(coin, amount, prices);
    if (supraAmount > 0n) {
      sdk.util.sumSingleBalance(balances, TOKENS.SUPRA, supraAmount.toString());
    }
  }
}

async function tvl(api) {
  const balances = {};

  const [prices, allPools] = await Promise.all([
    fetchTokenPrices(),
    getAllPools(),
  ]);

  for (const poolData of allPools) {
    const pool = poolData.value;
    if (!pool?.coins?.length || !pool?.pool_balances?.length) continue;

    const coins = pool.coins.map((c) => FA_TO_COIN[c.inner] || c.inner);
    const poolBalances = pool.pool_balances.map(BigInt);
    const numAssets = coins.length;

    const coreIndices = [];
    const nonCoreIndices = [];
    for (let i = 0; i < coins.length; i++) {
      if (isCoreAsset(coins[i])) {
        coreIndices.push(i);
      } else {
        nonCoreIndices.push(i);
      }
    }

    if (coreIndices.length === 0) continue;

    if (coreIndices.length === 1) {
      const i = coreIndices[0];
      const coin = coins[i];
      const balance = poolBalances[i];

      if (!balance || balance === 0n) continue;

      const weight = getAssetWeight(pool, i, numAssets);
      const finalBalance = weight > 0 && weight <= 100
        ? (balance * 100n) / BigInt(Math.round(weight))
        : balance * BigInt(numAssets);

      addToBalances(balances, coin, finalBalance, prices);
    } else {
      for (const i of coreIndices) {
        const coin = coins[i];
        const balance = poolBalances[i];

        if (!balance || balance === 0n) continue;

        addToBalances(balances, coin, balance, prices);
      }

      if (nonCoreIndices.length > 0 && coreIndices.length > 0) {
        const firstCoreIdx = coreIndices[0];
        const firstCoreCoin = coins[firstCoreIdx];
        const firstCoreBalance = poolBalances[firstCoreIdx];
        const firstCoreWeight = getAssetWeight(pool, firstCoreIdx, numAssets);

        if (firstCoreBalance > 0n && firstCoreWeight > 0) {
          let totalNonCoreWeight = 0;
          for (const j of nonCoreIndices) {
            totalNonCoreWeight += getAssetWeight(pool, j, numAssets);
          }

          if (totalNonCoreWeight > 0) {
            const nonCoreValue = (firstCoreBalance * BigInt(Math.round(totalNonCoreWeight))) / BigInt(Math.round(firstCoreWeight));
            addToBalances(balances, firstCoreCoin, nonCoreValue, prices);
          }
        }
      }
    }
  }

  return transformBalances(api.chain, balances);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  supra: { tvl },
};
