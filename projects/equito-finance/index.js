const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/sumTokens");

// Addresses
const ALGO_VAULT = "XYE5SU66M6JV24REYQJMXUMIWK54X5I6TWYP25RIA3NH7YEEY6UPPWM3RY";
const ETH_VAULT = "0x274af57Cc969cA96980BA043332D4fb79F496708";
const BSC_VAULT = "0x9Aa09a1D7ACD6Bb7b4bB5ae4c6F91279E78502a8";

module.exports = {
  hallmarks: [
    [1671724719, "Start of bridge"],
    [1683547217, "Ethereum, Binance vaults deployed"],
  ],
  methodology:
    "TVL counts native tokens locked in EquitoFinance bridge vaults.",
  algorand: { tvl: sumTokensExport({ owner: ALGO_VAULT,}) },
  ethereum: { tvl: sumTokensExport({ owner: ETH_VAULT, tokens: [ADDRESSES.null]}) },
  bsc: { tvl: sumTokensExport({ owner: BSC_VAULT, tokens: [ADDRESSES.null]}) },
};
