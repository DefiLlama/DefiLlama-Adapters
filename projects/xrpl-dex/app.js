const ADDRESSES = require('../helper/coreAssets.json')
const rippleCodec = require("ripple-binary-codec");
const { PromisePool } = require("@supercharge/promise-pool");
const { getCache, setCache } = require("../helper/cache");
const { transformDexBalances } = require("../helper/portedTokens");
const xrpl = require("xrpl");


const NODE_URL = "https://xrplcluster.com";
// const xrpTBILL = 'rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn'

const fetchLedgerData = async (binary, marker, atLedgerIndex) => {
  const xrplResponse = await fetch(NODE_URL, {
    method: "POST",
    body: JSON.stringify({
      method: "ledger_data",
      params: [
        {
          ledger_index: atLedgerIndex ?? "validated",
          binary,
          type: "amm",
          ...(marker && { marker: marker }),
        },
      ],
    }),
  });
  const xrplResponseJson = await xrplResponse.json();
  return {
    state: xrplResponseJson.result.state,
    marker: xrplResponseJson.result.marker,
  };
};

const fetchPoolReserves = async (pool, atLedgerIndex) => {
  const xrplResponse = await fetch(NODE_URL, {
    method: "POST",
    body: JSON.stringify({
      method: "amm_info",
      params: [
        {
          ledger_index: atLedgerIndex ?? "validated",
          asset: pool.asset1,
          asset2: pool.asset2,
        },
      ],
    }),
  });
  const xrplResponseJson = await xrplResponse.json();
  return {
    token0: parseReserve(xrplResponseJson.result.amm?.amount),
    token1: parseReserve(xrplResponseJson.result.amm?.amount2),
  };
};

let lastPrinted = 0
const discoverPools = async (nextMarker, isBinary, atLedgerIndex, poolsFound = []) => {
  const { state, marker } = await fetchLedgerData(
    isBinary,
    nextMarker,
    atLedgerIndex
  );
  if (state && state.length != 0) {
    const decodedState = isBinary
      ? state.map((entry) => rippleCodec.decode(entry.data))
      : state;
    poolsFound.push(
      ...decodedState.map((entry) => ({
        account: entry.Account,
        asset1: {
          currency: entry.Asset.currency,
          issuer: entry.Asset.issuer,
        },
        asset2: {
          currency: entry.Asset2.currency,
          issuer: entry.Asset2.issuer,
        },
      }))
    );
  }

  if (poolsFound.length % 10 === 0 && lastPrinted !== poolsFound.length) {
    console.log(new Date(), "Pools found so far ", poolsFound.length);
    lastPrinted = poolsFound.length;
  }
  if (marker)
    return discoverPools(
      marker,
      isBinary,
      atLedgerIndex,
      poolsFound
    )
  return poolsFound;
};

const parseReserve = (reserveData) => {
  if (!reserveData) return null;
  const reserveIsXrp = typeof reserveData === "string";
  return {
    currency: reserveIsXrp ? [ADDRESSES.ripple.XRP]: reserveData.currency,
    issuer: reserveIsXrp ? null : reserveData.issuer,
    amount: reserveIsXrp ? reserveData : reserveData.value,
  };
};

const getAllPoolsReserves = async (poolAddresses, atLedgerIndex) => {
  const poolsWithReserves = [];

  const { errors } = await PromisePool.withConcurrency(14)
    .for(poolAddresses)
    .process(async (pool) => {
      const { token0, token1 } = await fetchPoolReserves(pool, atLedgerIndex);
      poolsWithReserves.push({
        pool: pool.account,
        token0Reserve: token0,
        token1Reserve: token1,
      });
    });
  if (errors.length > 0)
    throw new Error(errors[0])
  return poolsWithReserves
}

main().catch(console.error).then(() => {
  console.log("done");
  process.exit(0)
})

function getTimeNow() {
  return Math.floor(Date.now() / 1000);
}

async function xrplDex () {
  const timeNow = getTimeNow()
  const aDayInSeconds = 60 * 60 * 24;
  const projectKey = 'xrpl-dex'
  const cacheKey = 'cache'
  let { allPools, lastPoolUpdate, lastDataUpdate, tvl } = await getCache(projectKey, cacheKey)
  if (!lastPoolUpdate || timeNow - lastPoolUpdate > 3 * aDayInSeconds) {
    // try {
    console.time("xrpl-dex fetch pool list");
    allPools = await discoverPools(null, 1);
    console.timeEnd("xrpl-dex fetch pool list");
    lastPoolUpdate = getTimeNow();
    await setCache(projectKey, cacheKey, { allPools, lastPoolUpdate, lastDataUpdate, tvl })
    // } catch (e) {
    //   console.error(e)
    // }
  }
  if (lastDataUpdate && timeNow - lastDataUpdate < 2 * 60 * 60) {
    // data was updated recently, no need to update
    return
  }
  const poolsWithReserves = await getAllPoolsReserves(allPools);

  tvl = await transformDexBalances({
    chain: 'ripple',
    data: poolsWithReserves
      .filter(i => i.token0Reserve && i.token1Reserve)
      .map(i => ({
        token0: i.token0Reserve.currency,
        token0Bal: i.token0Reserve.amount,
        token1: i.token1Reserve.currency,
        token1Bal: i.token1Reserve.amount,
      })),
  })
  await setCache(projectKey, cacheKey, {
    allPools, lastPoolUpdate, lastDataUpdate: getTimeNow(), tvl,
  })
}

async function openedenRippleTvl() {
  const timeNow = getTimeNow()
  const aDayInSeconds = 60 * 60 * 24;
  const projectKey = 'openeden-tbill'
  const cacheKey = 'cache'
  let { lastDataUpdate, tvl } = await getCache(projectKey, cacheKey)
  if (!lastDataUpdate || timeNow - lastDataUpdate > aDayInSeconds) {
    lastDataUpdate = getTimeNow()

    const client = new xrpl.Client('wss://xrplcluster.com/');
    await client.connect();
  
    const issuerAddress = "rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn";
    const subscriptionOperatorAddress = "rB56JZWRKvpWNeyqM3QYfZwW4fS9YEyPWM";
  
    const issuerAccountInfo = await client.request({
      command: 'gateway_balances',
      account: issuerAddress,
      hotwallet: [subscriptionOperatorAddress],
    });
  
    tvl = Math.round(Number(issuerAccountInfo.result.obligations?.TBL)) || 0;
    await setCache(projectKey, cacheKey, { lastDataUpdate, tvl })
    client.disconnect();
  }
}

async function main() {
  return  Promise.allSettled([
    // openedenRippleTvl(),
    xrplDex()
  ])
}