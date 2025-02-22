const { aaveChainTvl, methodology } = require("../helper/aave");
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
    methodology,
  ethereum: {
    tvl: lending(false),
    borrowed: lending(true),
    pool2: stakings([PoolV1, PoolV2], [SLP]),
  },
};
