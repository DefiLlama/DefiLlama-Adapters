const { tokens } = require('../helper/tokenMapping')

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      const tvl = await api.call({  abi: 'uint256:getContractTVL', target: '0x7623e9DC0DA6FF821ddb9EbABA794054E078f8c4'})
      return {
        [tokens.ethereum]: tvl
      }
    }
  }
}