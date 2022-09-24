const { aaveChainTvl } = require("../helper/aave");

function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    return aaveChainTvl(
      "ethereum",
      "0xaC538416BA7438c773F29cF58afdc542fDcABEd4",
      undefined,
      undefined,
      borrowed
    )(timestamp, ethBlock, chainBlocks);
  };
}

module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  ethereum: {
    tvl: lending(false),
    borrowed: lending(true),
  },
};
