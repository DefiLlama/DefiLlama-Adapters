const { uniV3GraphExport } = require('../helper/uniswapV3')

module.exports = {
  xlayer: {
    tvl: uniV3GraphExport({ graphURL: "https://subgraph.okiedokie.fun/subgraphs/name/okieswap-v3", name: 'okieswap-v3-xlayer', })
  },
};
