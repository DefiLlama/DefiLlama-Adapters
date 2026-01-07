const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Boros by Pendle: Yield trading with margin platform
// Market Hub stores all collateral for the Boros product
const BOROS_MARKET_HUB = "0x1080808080f145b14228443212e62447C112ADaD";
const BOROS_ROUTER = "0x8080808080daB95eFED788a9214e400ba552DEf6"; // For reference

const tvl = async (api) => {
  const commonTokens = [
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.WBTC,
    ADDRESSES.arbitrum.USDT,
  ];

  await sumTokens2({
    api,
    tokensAndOwners: commonTokens.map(token => [token, BOROS_MARKET_HUB]),
  });
}


module.exports = {
  methodology: "Boros TVL is calculated by summing all collateral tokens held in the Boros Market Hub contract. Boros is Pendle's yield trading with margin platform that enables trading of funding rates and other off-chain yields.",

  arbitrum: {
    tvl,
  },
}