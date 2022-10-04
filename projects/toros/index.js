const sdk = require("@defillama/sdk");
const BN = require("bignumber.js");

const { DHEDGE_FACTORY_ABI, TOROS_POOL_ABI } = require("./abis");
const { CONFIG_DATA } = require("./config");

const getCalculationMethod = (chain) => {
  const { transformAddress, dhedgeFactory, torosMultisigManager, daiToken } =
    CONFIG_DATA[chain];

  return async (timestamp, block, chainBlocks) => {
    const balances = {};
    const transform = await transformAddress();

    const pools = (
      await sdk.api.abi.call({
        abi: DHEDGE_FACTORY_ABI,
        chain,
        target: dhedgeFactory,
        params: [torosMultisigManager],
        block: chainBlocks[chain],
      })
    ).output;

    const poolSummaries = (
      await sdk.api.abi.multiCall({
        abi: TOROS_POOL_ABI,
        calls: pools.map((target) => ({ target, params: [] })),
        chain,
        block: chainBlocks[chain],
      })
    ).output;

    const totalValue = poolSummaries
      .reduce(
        (acc, { output: { totalFundValue } }) => acc.plus(totalFundValue),
        new BN(0)
      )
      .toFixed();

    sdk.util.sumSingleBalance(balances, transform(daiToken), totalValue);

    return balances;
  };
};

module.exports = {
  timetravel: true,
  start: 1627776000, // Sunday, August 1, 2021 12:00:00 AM
  methodology:
    "Aggregates total value of each Toros product both on Polygon and Optimism",
  polygon: {
    tvl: getCalculationMethod("polygon"),
  },
  optimism: {
    tvl: getCalculationMethod("optimism"),
  },
};
