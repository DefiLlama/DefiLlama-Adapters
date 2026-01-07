const { uniV3GraphExport } = require('../helper/uniswapV3')

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dex, pulling data from subgraph",
  hydra: {
    tvl: () => ({}),
  },
  hydragon: {
    tvl: uniV3GraphExport({ graphURL: "https://subgraph.hydrachain.org/subgraphs/name/v3-subgraph", name: 'hydradex-v3', })
  },
};
