const { staking } = require("../helper/staking");
const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const {uniTvlExport} = require('../helper/calculateUniTvl')

const chainTvls = getChainTvl({
  fantom: "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-fantom",
  polygon: "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-polygon",
  bsc: "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph"
})

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: chainTvls('bsc'),
  },
  polygon: {
    tvl: uniTvlExport('0x668ad0ed2622c62e24f0d5ab6b6ac1b9d2cd4ac7','polygon'),
  },
  fantom: {
    staking: staking("0x9180583C1ab03587b545629dd60D2be0bf1DF4f2", "0x3D8f1ACCEe8e263F837138829B6C4517473d0688","fantom", "bsc:0x0487b824c8261462f88940f97053e65bdb498446"),
    tvl: chainTvls('fantom'),
  },
};
