const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const BRIDGE_ADDRESS = "0xde26aeE51885AD5239f9F7C207214f5Bf547c8f2"
const CORE_TOKENS = [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.WETH]

const tvl = async (api) => {
  return sumTokens2({ api, owner: BRIDGE_ADDRESS, tokens: CORE_TOKENS })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL is calculated by summing tokens held in the Rocket Bridge contract on Arbitrum",
  arbitrum: { tvl },
};