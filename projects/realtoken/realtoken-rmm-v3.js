const { aaveChainTvl } = require("../helper/aave");

function rmmV3Tvl() {
  const rmmV3Params = [
    "0xC6c4b123e731819AC5f7F9E0fe3A118e9b1227Cd",
    undefined,
    ["0x11B45acC19656c6C52f93d8034912083AC7Dd756"],
  ];

  const section = (borrowed) =>
    aaveChainTvl("gnosis", ...rmmV3Params, borrowed, true);
  return {
    tvl: section(false),
    borrowed: section(true),
  };
}

module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  gnosis: rmmV3Tvl(),
};
