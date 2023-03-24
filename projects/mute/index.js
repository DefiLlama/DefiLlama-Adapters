const { getChainTvl } = require('../helper/getUniSubgraphTvl');

module.exports = {
    misrepresentedTokens: true,
    era: {
      tvl: getChainTvl({
        era: "https://graph.mute.io/subgraphs/name/mattt21/muteswitch_mainnet"
      }, "muteSwitchFactories")("era"),
    },
    methodology:
      "Counts liquidity in pools",
};