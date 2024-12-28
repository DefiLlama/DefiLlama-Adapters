const abis = require("./abis.js").abis;
const registry = require("./registry.js").registry;
const { staking } = require('../helper/staking');
const { sumTokens2 } = require("../helper/unwrapLPs.js");

async function borrowed(api) {

  const cyTokens = Object.values(registry.cTokens);
  const borrowed = await api.multiCall({ calls: cyTokens, abi: abis.totalBorrows, });

  const ib = Object.values(registry.ibTokens);
  for (const idx in borrowed) {
    api.add(ib[idx], borrowed[idx])
  }
}

async function tvl(api) {
  const tokens = [
    registry.CVX,
    registry.DAI,
    registry.KP3R,
    registry.SUSHI,
    registry.CRV,
    registry.CVXCRV,
    registry.SPELL,
    registry.WETH,
    registry.KPR_WETH_SUSHI_POOL,
    registry.USDC_ibAUD_POOL,
    registry.USDC_ibEUR_POOL,
    registry.USDC_ibKRW_POOL,
    registry.USDC_ibJPY_POOl,
    registry.USDC_ibGBP_POOL,
    registry.USDC_ibCHF_POOL,
  ].concat(Object.values(registry.ibTokens))

  await api.sumTokens({
    tokens, owners: [registry.YEARN_DEPLOYER, registry.BOND_TREASURY].concat(
      Object.values(registry.cTokens),
      Object.values(registry.ibCrvGauges)
    ),
  })
  await api.sumTokens({ tokens: Object.values(registry.Kp3rV2Klps), owner: registry.KP3RV2, })
  await api.sumTokens({ tokens: Object.values(registry.Kp3rV1Slps), owner: registry.KP3R, })
  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  ethereum: {
    tvl,
    staking: staking(registry.VKP3R, registry.KP3R),
    borrowed
  },
};
