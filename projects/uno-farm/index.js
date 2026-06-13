const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUserMasterChefBalances } = require("../helper/masterchef");
const apps = require("./apps.json");

const factoryAbi = {
  poolLength: "uint256:poolLength",
  pools: "function pools(uint256) view returns (address)",
  Farms: "function Farms(address) view returns (address)",
};

/** Get all farm addresses from a UnoFarm factory */
async function getFarms(api, factory) {
  const lpTokens = await api.fetchList({ lengthAbi: factoryAbi.poolLength, itemAbi: factoryAbi.pools, target: factory });
  return api.multiCall({ abi: factoryAbi.Farms, target: factory, calls: lpTokens });
}

/** Get farms paired with their LP tokens */
async function getFarmsWithLPs(api, factory) {
  const lpTokens = await api.fetchList({ lengthAbi: factoryAbi.poolLength, itemAbi: factoryAbi.pools, target: factory });
  const farms = await api.multiCall({ abi: factoryAbi.Farms, target: factory, calls: lpTokens });
  return farms.map((farm, i) => ({ farm, lpToken: lpTokens[i] }));
}

const LP_EXTRACTORS = {
  simple: (output) => output,
  tuple: (output) => output[0],
};

async function defaultTVL(api, app) {
  const farms = await getFarms(api, app.factory);
  const promises = [];
  for (let k = 0; k < app.masterChefs.length; k++) {
    const extractorName = app.lpExtractor?.[k] ?? "simple";
    const getLPAddress = LP_EXTRACTORS[extractorName] ?? null;
    for (const farm of farms) {
      promises.push(
        getUserMasterChefBalances({
          balances: api.getBalances(),
          masterChefAddress: app.masterChefs[k],
          userAddres: farm,
          block: api.block,
          chain: api.chain,
          poolInfoABI: app.poolInfoABI[k],
          getLPAddress,
        })
      );
    }
  }
  await Promise.all(promises);
}

async function balancerTVL(api, app) {
  const farmsData = await getFarmsWithLPs(api, app.factory);
  const gauges = await api.multiCall({ abi: "address:gauge", calls: farmsData.map((v) => v.farm) });
  const tokensAndOwners = farmsData.map((v, i) => [gauges[i], v.farm]);
  return sumTokens2({ api, tokensAndOwners });
}

async function quickswapTVL(api, app) {
  const farmsData = await getFarmsWithLPs(api, app.factory);
  const stakeTokens = await api.multiCall({ abi: "address:lpPair", calls: farmsData.map((v) => v.farm), permitFailure: true });
  const valid = farmsData.map((v, i) => ({ ...v, stakeToken: stakeTokens[i] })).filter((v) => v.stakeToken);
  const tokensAndOwners = valid.map((v) => [v.stakeToken, v.farm]);
  await sumTokens2({ api, tokensAndOwners, resolveLP: true });
}

const TVL_HANDLERS = { balancer: balancerTVL, quickswap: quickswapTVL };

async function tvl(api) {
  const chainApps = apps[api.chain] ?? [];
  await Promise.all(
    chainApps.map((app) => (TVL_HANDLERS[app.name] ?? defaultTVL)(api, app))
  );
}

module.exports = {
  start: '2022-06-23',
  polygon: { tvl },
  bsc: { tvl },
  aurora: { tvl },
  avax: { tvl },
};
