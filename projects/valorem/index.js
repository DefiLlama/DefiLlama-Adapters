const { sumTokensExport } = require("../helper/unwrapLPs");

const CLEARINGHOUSE_ADDRESS = "0x402A401B1944EBb5A3030F36Aa70d6b5794190c9";
const arbitrumOneDeployUnixTimestamp = 1693583626;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const TOKENS_BY_CHAIN = {
  ["arbitrum"]: {
    ETH: ZERO_ADDRESS,
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
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
