const { sumTokens } = require('../helper/unwrapLPs')
const config = require('./config')

module.exports = {}

function setChainTVL(chain) {
  const { lp, uwp_address, tokens, solace, } = config[chain]
  module.exports[chain] = {
    tvl: async (ts, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      const toa = tokens.map(i => [i.PoolToken, uwp_address])
      return sumTokens({}, toa, block, chain)
    }
  }

  if (lp)
    module.exports[chain].pool2 = async (ts, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      return sumTokens({},[ [lp, uwp_address]], block, chain, undefined, { resolveLP: true })
    }

  if (solace)
    module.exports[chain].staking = async (ts, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      return sumTokens({}, [[solace, uwp_address]], block, chain, undefined, { resolveLP: true })
    }
}

Object.keys(config).forEach(setChainTVL)
