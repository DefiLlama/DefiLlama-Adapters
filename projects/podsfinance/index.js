const sdk = require('@defillama/sdk')

const { NETWORK_POLYGON, NETWORK_MAINNET } = require('./constants.js')
const { getTVL } = require('./queries.js')

async function getEthereumTVL (time, ethBlock, chainBlocks) {
  return getTVL(NETWORK_MAINNET, ethBlock)
}

async function getPolygonTVL (time, ethBlock, chainBlocks) {
  return getTVL(NETWORK_POLYGON, chainBlocks[NETWORK_POLYGON.name])
}

module.exports = {
  ethereum: {
    tvl: getEthereumTVL
  },
  polygon: {
    tvl: getPolygonTVL
  },
  tvl: sdk.util.sumChainTvls([getEthereumTVL, getPolygonTVL])
}
