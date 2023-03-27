const sdk = require("@defillama/sdk");

const abis = require("./abis.js").abis;
const registry = require("./registry.js").registry;
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

async function staking(_timestamp, block) {
  const { KP3R, VKP3R } = registry;
  const balances = {};

  await sumTokensAndLPsSharedOwners(balances, [[KP3R, false]], [VKP3R], block);

  // @dev should return stakingTvl
  return balances;
}

async function borrowed(_timestamp, block) {
  /** @type {Balances} */
  const balances = {};

  const cyTokens = Object.values(registry.cTokens);
  const { output: borrowed } = await sdk.api.abi.multiCall({
    block: block,
    calls: cyTokens.map((coin) => ({
      target: coin,
    })),
    abi: abis.totalBorrows,
  });

  const ib = Object.values(registry.ibTokens);
  for (const idx in borrowed) {
    sdk.util.sumSingleBalance(
      balances,
      ib[idx].toLowerCase(),
      borrowed[idx].output
    );
  }

  return balances;
}

async function tvl(_timestamp, block) {
  /** @type {Balances} */
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [registry.CVX, false],
      [registry.DAI, false],
      [registry.KP3R, false],
      [registry.SUSHI, false],
      [registry.CRV, false],
      [registry.CVXCRV, false],
      [registry.SPELL, false],
      [registry.WETH, false],
    ].concat(
      [
        [registry.KPR_WETH_SUSHI_POOL, false],
        [registry.USDC_ibAUD_POOL, false],
        [registry.USDC_ibEUR_POOL, false],
        [registry.USDC_ibKRW_POOL, false],
        [registry.USDC_ibJPY_POOl, false],
        [registry.USDC_ibGBP_POOL, false],
        [registry.USDC_ibCHF_POOL, false],
      ],
      Object.values(registry.ibTokens).map((t) => [t, false])
    ),
    [registry.YEARN_DEPLOYER, registry.BOND_TREASURY].concat(
      Object.values(registry.cTokens),
      Object.values(registry.ibCrvGauges)
    ),
    block
  );

  await sumTokensAndLPsSharedOwners(
    balances,
    Object.values(registry.Kp3rV2Klps).map((t) => [t, false]),
    [registry.KP3RV2],
    block
  );

  await sumTokensAndLPsSharedOwners(
    balances,
    Object.values(registry.Kp3rV1Slps).map((t) => [t, false]),
    [registry.KP3R],
    block
  );

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
    staking,
    borrowed
  },
};
