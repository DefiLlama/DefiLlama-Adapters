const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/chain/algorand");
const ADDRESSES = require("../helper/coreAssets.json");

// Addresses
const ALGO_VAULT = "XYE5SU66M6JV24REYQJMXUMIWK54X5I6TWYP25RIA3NH7YEEY6UPPWM3RY";
const ETH_VAULT = "0x274af57Cc969cA96980BA043332D4fb79F496708";
const BSC_VAULT = "0x9Aa09a1D7ACD6Bb7b4bB5ae4c6F91279E78502a8";
const ETH = ADDRESSES.null;

// TVL calculation
async function algoTvl() {
  return await sumTokens({ owners: [ALGO_VAULT] });
}

async function ethTvl() {
  const balances = {};

  const ethBalance = (
    await sdk.api.eth.getBalance({
      target: ETH_VAULT,
      chain: "ethereum",
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ETH, ethBalance);

  return balances;
}

async function bscTvl() {
  const balances = {};

  const bscBalance = (
    await sdk.api.eth.getBalance({
      target: BSC_VAULT,
      chain: "bsc",
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ETH, bscBalance, "bsc");

  return balances;
}

module.exports = {
  hallmarks: [
    [1671724719, "Start of bridge"],
    [1683547217, "Ethereum, Binance vaults deployed"],
  ],
  methodology:
    "TVL counts native tokens locked in EquitoFinance bridge vaults.",
  algorand: { tvl: algoTvl },
  ethereum: {
    tvl: ethTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
};
