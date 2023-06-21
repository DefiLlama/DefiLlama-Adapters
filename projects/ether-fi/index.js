const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const ethTVL = async (block) => {
  const tvl = await sdk.api.abi.call({
    block,
    chain: 'optimism',
    abi: 'uint256:getTvl',
    target: '0x7623e9DC0DA6FF821ddb9EbABA794054E078f8c4',
  })
  return tvl.output
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: async (_, block, _2) => {
      const tvl = await ethTVL(block)

      return {
        ['ethereum:' + ADDRESSES.null]: tvl
      }
    }
  }
}
