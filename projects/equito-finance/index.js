const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/sumTokens");

// Addresses
const ALGO_VAULT1 =
  "XYE5SU66M6JV24REYQJMXUMIWK54X5I6TWYP25RIA3NH7YEEY6UPPWM3RY";
const ETH_VAULT1 = "0x274af57Cc969cA96980BA043332D4fb79F496708";
const BSC_VAULT1 = "0x9Aa09a1D7ACD6Bb7b4bB5ae4c6F91279E78502a8";

const ALGO_VAULT2 =
  "56CF35MFZHMCWTVJZLNBTP62UJKFRRKW47GTSOVATZONVEZ6ASSWRWOOHM";
const ETH_VAULT2 = "0x4d753245f273e119Be944Ae180A17DfE35258e1e";
const BSC_VAULT2 = "0x7aFeCFABBA462121262D81d764e289aB77966aec";

// Tokens
const ETH_PSYOP = "0xaa07810aE08575921c476Ff088bc949da43e4964";

module.exports = {
  hallmarks: [
    [1671724719, "Start of bridge"],
    [1683547217, "Ethereum, Binance vaults deployed"],
  ],
  methodology:
    "TVL counts native tokens locked in EquitoFinance bridge vaults.",
  algorand: { tvl: sumTokensExport({ owners: [ALGO_VAULT1, ALGO_VAULT2], logCalls: true }) },
  ethereum: {
    tvl: sumTokensExport({
      owners: [ETH_VAULT1, ETH_VAULT2],
      tokens: [ADDRESSES.null, ADDRESSES.ethereum.INU, ETH_PSYOP],
      logCalls: true
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [BSC_VAULT1, BSC_VAULT2],
      tokens: [ADDRESSES.null],
      logCalls: true 
    }),
  },
};
