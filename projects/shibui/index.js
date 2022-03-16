const { chainExports } = require("../helper/exports");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");

const Boba_WETH = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000";
const Boba_BOBA = "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7";
const Boba_SHIBUI_WETH = "0xcE9F38532B3d1e00a88e1f3347601dBC632E7a82";

const CHAIN_ORGANISED_DATA = {
  boba: {
    treasuryTokens: [
      [Boba_WETH, false],
      [Boba_BOBA, false],
      [Boba_SHIBUI_WETH, true],
    ],
    treasuryAddresses: [
      // TokenManager
      "",
      // Timelock
      "",
    ],
  },
};

const chainTVL = (chain) => {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const block = await getBlock(timestamp, chain, chainBlocks);
    const data = CHAIN_ORGANISED_DATA[chain];

    await sumTokensAndLPsSharedOwners(
      balances,
      data.treasuryTokens,
      data.treasuryAddresses,
      block
    );

    return balances;
  };
};

module.exports = chainExports(chainTVL, ["boba"]);
module.exports.methodology = "";
