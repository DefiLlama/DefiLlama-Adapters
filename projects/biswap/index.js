const {getChainTvl} = require("../helper/getUniSubgraphTvl");
const {uniTvlExport} = require("../helper/calculateUniTvl");

const factory = "0x858e3312ed3a876947ea49d572a7c42de08af7ee";

const subgraphTvl = getChainTvl({
  "bsc": "https://api.thegraph.com/subgraphs/name/biswapcom/exchange5"
}, "pancakeFactories")('bsc')

module.exports = {
  bsc: {
    tvl: uniTvlExport(factory, "bsc")
  },
};