const { aaveChainTvl } = require("../helper/aave");

const params = [
  "{addressesProviderRegistry}",
  undefined,
  ["{dataHelperAddresses}"],
];

function v3() {
  const section = (borrowed) => aaveChainTvl("base", ...params, borrowed, true);
  return {
    tvl: section(false),
    borrowed: section(true),
  };
}

module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  base: v3(),
};
// node test.js projects/aave/index.js
