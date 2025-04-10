const { uniV3GraphExport } = require('../helper/uniswapV3')
module.exports = {
  shido: { tvl: uniV3GraphExport({ graphURL: 'https://ljd1t705przomdjt11587.cleavr.xyz/subgraphs/name/shido/mainnet', name: 'shido-dex' }) }
}