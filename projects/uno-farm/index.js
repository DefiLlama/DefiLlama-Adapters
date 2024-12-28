const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const {
  getUnoFarms,
  getFullInfoBalancerUnoFarm,
  getFullInfoQuickswapUnoFarm,
} = require("./uno-helplers");
const { getUserMasterChefBalances } = require("../helper/masterchef");
const apps = require("./apps.json");

async function defaultTVL({ balances, chain, block, app }) {
  const farms = await getUnoFarms({ chain, block, factory: app.factory });
  const promises = [];

  for (let k = 0; k < app.masterChefs.length; k++) {
    for (let i = 0; i < farms.length; i++) {
      promises.push(
        getUserMasterChefBalances({
          balances,
          masterChefAddress: app.masterChefs[k],
          userAddres: farms[i],
          block,
          chain,
          poolInfoABI: app.poolInfoABI[k],
          getLPAddress: app.getLPAddress[k] ? eval(app.getLPAddress[k]) : null,
        })
      );
    }
  }
  await Promise.all(promises);
}

async function balancerTVL({ balances, chain, block, app }) {
  const farms = await getFullInfoBalancerUnoFarm({
    chain,
    block,
    factory: app.factory,
  });

  const tokensAndOwners = farms.map((v) => [v.gauge, v.farm]);
  await sumTokens2({ balances, block, chain, tokensAndOwners });
}

async function quickswapTVL({ balances, chain, block, app }) {
  const transform = (addr) => chain + ":" + addr;
  const farms = await getFullInfoQuickswapUnoFarm({
    chain,
    block,
    factory: app.factory,
  });
  const balanceOfFarmCalls = farms.map((v) => ({
    target: v.lpToken,
    params: v.farm,
  }));
  const balanceOfFarm = (
    await sdk.api.abi.multiCall({
      block,
      calls: balanceOfFarmCalls,
      abi: "erc20:balanceOf",
      chain,
    })
  ).output.map((a) => a.output);
  farms.map((v, i) => {
    sdk.util.sumSingleBalance(
      balances,
      transform(v.stakeToken),
      balanceOfFarm[i]
    );
  });
}

async function tvl(api) {
  const chain = api.chain;
  const block = api.block;
  let balances = {};
  const promises = [];
  const arrayOfApps = apps[chain];
  for (let j = 0; j < arrayOfApps.length; j++) {
    const app = arrayOfApps[j];
    if (app.name == "balancer") {
      promises.push(balancerTVL({ balances, chain, block, app }));
    } else if (app.name == "quickswap") {
      promises.push(quickswapTVL({ balances, chain, block, app }));
    } else {
      promises.push(defaultTVL({ balances, chain, block, app }));
    }
  }
  await Promise.all(promises);
  return balances;
}

module.exports = {
  start: '2022-06-23',
    polygon: {
    tvl,
  },
  bsc: {
    tvl,
  },
  aurora: {
    tvl,
  },
  avax: {
    tvl,
  },
};
