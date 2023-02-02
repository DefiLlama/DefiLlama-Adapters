const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const {
  getUnoFarms,
  getFullInfoBalancerUnoFarm,
  getFullInfoQuickswapUnoFarm,
} = require("./uno-helplers");
const { getUserMasterChefBalances } = require("../helper/masterchef");
const apps = require("./apps.json");
const { getChainTransform } = require("../helper/portedTokens");

async function defaultTVL({ balances, chain, block, app }) {
  const farms = await getUnoFarms({ chain, block, factory: app.factory });

  for (let k = 0; k < app.masterChefs.length; k++) {
    for (let i = 0; i < farms.length; i++) {
      await getUserMasterChefBalances({
        balances,
        masterChefAddress: app.masterChefs[k],
        userAddres: farms[i],
        block,
        chain,
        poolInfoABI: app.poolInfoABI[k],
        getLPAddress: app.getLPAddress[k] ? eval(app.getLPAddress[k]) : null,
      });
    }
  }
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
  const transform = await getChainTransform(chain);
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
    const res = sdk.util.sumSingleBalance(
      balances,
      transform(v.stakeToken),
      balanceOfFarm[i]
    );
  });
}

async function tvl(_, _1, chainBlocks, { api }) {
  const chain = api.chain;
  const block = chainBlocks[chain];
  let balances = {};
  const arrayOfApps = apps[chain];
  for (let j = 0; j < arrayOfApps.length; j++) {
    const app = arrayOfApps[j];
    if (app.name == "balancer") {
      await balancerTVL({ balances, chain, block, app });
    } else if (app.name == "quickswap") {
      await quickswapTVL({ balances, chain, block, app });
    } else {
      await defaultTVL({ balances, chain, block, app });
    }
  }
  return balances;
}

module.exports = {
  start: 1655206,
  polygon: {
    tvl,
  },
  bsc: {
    tvl,
  },
  aurora: {
    tvl,
  },
  methodology: "count the number of lp Tokens deposited to our farms",
};
