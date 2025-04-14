const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const VAULT_ADDRESS = "0x0C93A1D3F68a0554d37F3e7AF3a1442a94405E7A";
const LOCKQUIDITY_TOKEN_ADDRESS = "0x454F676D44DF315EEf9B5425178d5a8B524CEa03";
const arbitrumOneDeployUnixTimestamp = 1727644318; // Oct-13-2024 11:11:38 PM +UTC

const TOKENS_BY_CHAIN = {
  ["arbitrum"]: {
    WETH: ADDRESSES.arbitrum.WETH,
    LOCK: LOCKQUIDITY_TOKEN_ADDRESS,
  },
};

module.exports = {
  methodology:
    "TVL counts all of the tokens locked in the permanent Uniswap v2 LOCK/WETH pool.",
  arbitrum: {
    tvl:() => ({}),
    pool2: sumTokensExport({
      chain: "arbitrum",
      owner: VAULT_ADDRESS,
      tokens: [...Object.values(TOKENS_BY_CHAIN["arbitrum"])],
    }),
  },
  hallmarks: [[arbitrumOneDeployUnixTimestamp, "Lockquidity Launch"]],
};
