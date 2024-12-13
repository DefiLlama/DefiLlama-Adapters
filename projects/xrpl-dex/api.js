const ADDRESSES = require('../helper/coreAssets.json')
const rippleCodec = require("ripple-binary-codec");
const { PromisePool } = require("@supercharge/promise-pool");
const { getCache, setCache } = require("../helper/cache");
const axios = require('axios')

const NODE_URL = "https://xrplcluster.com";
const API_XRP = "https://api.xrpscan.com/api/v1/amm/"
const RATE_LIMIT_DELAY_MS = 500;
const MIN_POOL_SIZE = 9500
const getTimeNow = () => Math.floor(Date.now() / 1000);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const retry = async (fn, retries = 7, delay) => {
  let attempts = 0;
  while (attempts < retries) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed. Retrying...`);
      const currentDelay = delay ? delay : attempts * 1000;
      if (attempts >= retries) throw error;

      await sleep(currentDelay);
    }
  }
};

const getLedgerDatas = async (binary, marker, atLedgerIndex) => {
  const payload = {
    method: "ledger_data",
    params: [
      {
        ledger_index: atLedgerIndex ?? "validated",
        binary,
        type: "amm",
        ...(marker && { marker }),
      },
    ],
  };

  return await retry(async () => {
    const { data } = await axios.post(NODE_URL, payload);

    if (data.result && data.result?.state) {
      return {
        state: data.result.state,
        marker: data.result.marker,
      };
    }

    throw new Error("Invalid response format from XRPL");
  });
};

let poolIndex = 0;
const getPools = async (nextMarker, isBinary, atLedgerIndex, poolsFound = []) => {
  try {
    console.log(`${++poolIndex} Fetching pools... Marker: ${nextMarker || 'start'}, Pools found so far: ${poolsFound.length}`);
    const { state, marker } = await getLedgerDatas(isBinary, nextMarker, atLedgerIndex);

    if (state && state.length > 0) {
      const decodedState = isBinary
        ? state.map((entry) => rippleCodec.decode(entry.data))
        : state;

      poolsFound.push(
        ...decodedState.map((entry) => ({
          account: entry.Account,
          asset1: { currency: entry.Asset.currency, issuer: entry.Asset.issuer },
          asset2: { currency: entry.Asset2.currency, issuer: entry.Asset2.issuer },
        }))
      );

    }

    if (marker) {
      await sleep(RATE_LIMIT_DELAY_MS);
      return getPools(marker, isBinary, atLedgerIndex, poolsFound);
    }

  } catch (error) {
    console.error("Failed to fetch pools:", error.message);
  }
  
  return poolsFound;
};

const parseReserve = (reserveData) => {
  if (!reserveData) return null;

  const isXrp = typeof reserveData === "string";
  return {
    currency: isXrp ? ADDRESSES.ripple.XRP : reserveData.currency,
    issuer: isXrp ? null : reserveData.issuer,
    amount: isXrp ? reserveData : reserveData.value,
  };
};

const getReserveDatas = async (pool) => {
  return await retry(async () => {
    const { data } = await axios.get(API_XRP + pool.account);

    return {
      token0: parseReserve(data?.amount),
      token1: parseReserve(data?.amount2)
    }
  });
};

const getAllReservesDatas = async (poolAddresses, atLedgerIndex) => {
  const poolsWithReserves = [];

  const { errors } = await PromisePool.withConcurrency(4)
    .for(poolAddresses)
    .process(async (pool) => {
      try {
        await sleep(RATE_LIMIT_DELAY_MS);

        const { token0, token1 } = await getReserveDatas(pool, atLedgerIndex);
        poolsWithReserves.push({
          pool: pool.account,
          token0Reserve: token0,
          token1Reserve: token1,
        });
      } catch (error) {
        console.error("Errors occurred while fetching reserves:", errors);
      }
    });

  if (errors?.length) console.log(errors)
  if (errors.length > 0) throw errors[0]

  return poolsWithReserves;
};

const getXrplPools = async () => {
  const timeNow = getTimeNow()
  const startOfDay = Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000);
  let { pools: cachedPools = [], marker: lastMarker = null, lastUpdate = 0 } = await getCache('xrpl-dex', 'pools');

  if (lastUpdate >= startOfDay && cachedPools?.length > MIN_POOL_SIZE) {
    console.log(`Pools have already been updated today. Last update: ${new Date(lastUpdate * 1000).toISOString()}`);
    return;
  }

  console.time("xrpl-dex fetch pool list")

  try {
    const pools = await getPools(null, 1);
    console.timeEnd("xrpl-dex fetch pool list");
    console.log("Total pools fetched:", pools.length);
    const finalMarker = pools.marker || lastMarker

    await setCache('xrpl-dex', 'pools', { pools, marker: finalMarker, lastUpdate: timeNow });
  } catch (error) {
    console.error("Error during XRPL pool fetching:", error.message);
    console.timeEnd("xrpl-dex fetch pool list");
  }
}

const getXrplBalances = async (pools) => {
  const timeNow = getTimeNow();
  const startOfDay = Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000);
  const { balanaces: _preBalances, lastUpdate = 0 } = await getCache('xrpl-dex', 'balances') || {};

  if (lastUpdate >= startOfDay && _preBalances?.length > MIN_POOL_SIZE) {
    console.log(`Balances have already been updated today. Last update: ${new Date(lastUpdate * 1000).toISOString()}`);
    return;
  }

  console.time("Fetching balances for pools");

  try {
    const balances = await getAllReservesDatas(pools);
    console.timeEnd("Fetching balances for pools");
    await setCache('xrpl-dex', 'balances', { balances, lastUpdate: timeNow });
    return balances;
  } catch (error) {
    console.error("Error during balances fetching:", error.message);
  }
};

const main = async () => {
  await getXrplPools();
  const { pools = [] } = await getCache('xrpl-dex', 'pools');
  const seen = new Set();
  const uniquePools = pools.filter(pool => seen.has(JSON.stringify(pool)) ? false : seen.add(JSON.stringify(pool)));
  await getXrplBalances(uniquePools)
};

main().catch(console.error).finally(() => process.exit(0));