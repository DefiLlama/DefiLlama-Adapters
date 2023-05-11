const { aaveChainTvl } = require("../helper/aave");
const { stakings } = require("../helper/staking");

const PoolV1 = "0x7c0bF1108935e7105E218BBB4f670E5942c5e237";
const PoolV2 = "0x0a7B2A21027F92243C5e5E777aa30BB7969b0188";

const SLP = "0x3E04863DBa602713Bb5d0edbf7DB7C3A9A2B6027";

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
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending. The staking TVL is the protocol's revenue sharing pool locking UwU-ETH LP (SLP) tokens.",
  ethereum: {
    tvl: lending(false),
    borrowed: lending(true),
    pool2: stakings([PoolV1, PoolV2], [SLP], "ethereum"),
  },
};
