const { uniV3Export, uniV3GraphExport } = require("../helper/uniswapV3");



module.exports = {
  kava: { tvl: uniV3GraphExport({ name: 'kinetix-kava', graphURL: 'https://kava-graph-node.metavault.trade/subgraphs/name/kinetixfi/v3-subgraph' }) },
  base: { tvl: uniV3GraphExport({ name: 'kinetix-base', graphURL: 'https://api.studio.thegraph.com/query/55804/kinetixfi-base-v3/version/latest' }) }
}



// module.exports = uniV3Export({
//   kava: {
//     factory: "0x2dBB6254231C5569B6A4313c6C1F5Fe1340b35C2",
//     fromBlock: 6069472,
//   },
//   base: {
//     factory: "0xdDF5a3259a88Ab79D5530eB3eB14c1C92CD97FCf",
//     fromBlock: 14195510,
//   },
// });
