const sdk = require("@defillama/sdk");
const { getCompoundV2Tvl } = require("../helper/compound");
const { staking } = require("../helper/staking");
const hermesBar = "0x0000000000000000000000000000000000000000";
const hermesToken = "0x0000000000000000000000000000000000000000";
const comptroller = "0x0000000000000000000000000000000000000000";
const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const graphUrls = {
  harmony: "https://graph.hermesdefi.io/subgraphs/name/exchange",
};

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  methodology:
    'We calculate liquidity on all pairs with data retreived from the "hermes-defi/hermes-graph" subgraph. The staking portion of TVL includes the HermesTokens within the HermesBar contract.',
  harmony: {
    tvl: sdk.util.sumChainTvls([
      getChainTvl(graphUrls, "factories", "liquidityUSD")("harmony"),
      getCompoundV2Tvl(
        comptroller,
        "harmony",
        (addr) => `harmony:${addr}`,
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000"
      ),
    ]),
    borrowed: getCompoundV2Tvl(
      comptroller,
      "harmony",
      (addr) => `harmony:${addr}`,
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000",
      true
    ),
    staking: staking(hermesBar, hermesToken, "harmony"),
  },
};
