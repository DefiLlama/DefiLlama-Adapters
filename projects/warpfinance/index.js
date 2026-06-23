const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    contract: '0x312a6be6bD9850D6a2F793b8425c39eFC01C3585', whitelistedTokens: [ADDRESSES.ethereum.WETH]
  }
}

Object.keys(config).forEach(chain => {
  const {contract, whitelistedTokens,} = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      return sumTokens2({ api, owner: contract, uniV3WhitelistedTokens: whitelistedTokens, resolveUniV3: true, })
    }
  }
})

module.exports.methodology = 'Count the value of base tokens in the locked uni-v3 nfts'
module.exports.doublecounted = true