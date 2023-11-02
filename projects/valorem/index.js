const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const CLEARINGHOUSE_ADDRESS = "0x402A401B1944EBb5A3030F36Aa70d6b5794190c9";
const arbitrumOneDeployUnixTimestamp = 1693583626;

const ZERO_ADDRESS = ADDRESSES.null;
const TOKENS_BY_CHAIN = {
  ["arbitrum"]: {
    ETH: ZERO_ADDRESS,
    WETH: ADDRESSES.arbitrum.WETH,
    USDC: ADDRESSES.arbitrum.USDC,
  },
};

module.exports = {
  methodology:
    "TVL counts all of the tokens locked in the Clearinghouse for Option/Claim positions.",
  arbitrum: {
    tvl: sumTokensExport({
      chain: "arbitrum",
      owner: CLEARINGHOUSE_ADDRESS,
      tokens: [...Object.values(TOKENS_BY_CHAIN["arbitrum"])],
    }),
  },
  hallmarks: [[arbitrumOneDeployUnixTimestamp, "Valorem Launch"]],
};
