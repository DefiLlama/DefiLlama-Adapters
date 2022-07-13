const { staking } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const xCELL = "0xbe334d7208366B3E4Fb40348576227b524d8CBA0";
const CELL = "0xa685F488DEe49b75469E9e866965daBc8Ed6083d";
const factory = "0x78f406B41C81eb4144C321ADa5902BBF5de28538";
const coreAssets = [
  "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d",
]

const tvl = getUniTVL({ factory, chain: 'aurora', coreAssets })

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x78f406B41C81eb4144C321ADa5902BBF5de28538) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  aurora: {
    tvl,
    staking: staking(xCELL, CELL, "aurora")
  },
};
