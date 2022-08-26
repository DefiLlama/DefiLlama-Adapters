const sdk = require("@defillama/sdk");
const { uniTvlExport } = require("../helper/calculateUniTvl");

const energyfiFactory = "0x7c7EaEa389d958BB37a3fd08706Ca884D53Dc1F3";

const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const graphUrls = {
  moonbeam:
    "https://api.thegraph.com/subgraphs/name/energyfidevops/moonbeam-exchange",
};
module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  methodology:
    'We count liquidity on the pairs and we get that information from the "energyfidevops/moonbeam-exchange" subgraph. The staking portion of TVL includes the EnergyFiTokens within the EnergyFiBar contract.',
  moonbeam: {
    tvl: sdk.util.sumChainTvls([
      getChainTvl(graphUrls, "factories", "liquidityUSD")("moonbeam"),
    ]),

    ownTokens: uniTvlExport(energyfiFactory, "moonbeam"),
  },
};
