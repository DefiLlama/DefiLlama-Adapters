const { chainExports } = require("../helper/exports");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");
const { staking } = require('../helper/staking');

const Boba_SHIBUI = "0xf08ad7c3f6b1c6843ba027ad54ed8ddb6d71169b";

const Boba_WETH = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000";
const Boba_BOBA = "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7";
const Boba_USDT = "0x5de1677344d3cb0d7d465c10b72a8f60699c062d";
const Boba_SHIBUI_WETH = "0xcE9F38532B3d1e00a88e1f3347601dBC632E7a82";
const Boba_SHIBUI_USDT = "0x3f714fe1380ee2204ca499d1d8a171cbdfc39eaa";

const CHAIN_ORGANISED_DATA = {
  boba: {
    treasuryTokens: [
      [Boba_WETH, false],
      [Boba_BOBA, false],
      [Boba_USDT, false],
      [Boba_SHIBUI_WETH, true],
      [Boba_SHIBUI_USDT, true]
    ],
    treasuryAddresses: [
      "0x9596E01Ad72d2B0fF13fe473cfcc48D3e4BB0f70" // Hot treasury
    ],
  },
};

const chainTVL = (chain) => {
  return async (timestamp, _ethBlock, chainBlocks) => {
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
module.exports.boba.staking = staking("0xabAF0A59Bd6E937F852aC38264fda35EC239De82", Boba_SHIBUI);
