const sdk = require('@defillama/sdk')

const { NETWORK_MAINNET } = require('./constants.js')
const { getTVL } = require('./queries.js')

async function getEthereumTVL (time, ethBlock, chainBlocks) {
  return getTVL(NETWORK_MAINNET, ethBlock)
}

module.exports = {
  ethereum: {
    tvl: getEthereumTVL
  }
}
