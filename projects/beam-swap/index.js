/*const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const v2graph = getChainTvl({
  beam: 'https://graph.subresearch.com/subgraphs/name/0x0sub/uniswap-v2-beam'
})

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from subgraph`,
  beam: {
    tvl: v2graph('beam'),
  },
}*/

const { uniTvlExport } = require('../helper/unknownTokens');

module.exports = uniTvlExport('beam', '0x662b526FB70EBB508962f3f61c9F735f687C8fA5')