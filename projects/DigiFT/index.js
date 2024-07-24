const sdk = require('@defillama/sdk');
//Polygon FeedPrice contract address
const DFeedPriceAddress = "0x7d4d68f18d1be3410ab8d827fb7ebc690f938d2d"
const tokenListAbi = "function getAllTokenRecords() view returns (tuple(uint256 chainId, address tokenAddress, uint64 tokenType)[])"

async function getTokenList(tokenAPI, chainId) {
  return (await tokenAPI.call({
    target: DFeedPriceAddress,
    abi: tokenListAbi
  })).filter(item => item[0] == chainId && item[2] == '1').map(item => item[1]);
}

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const tokenAPI = new sdk.ChainApi({ chain: 'polygon', timestamp: api.timestamp, });
      const tokens = await getTokenList(tokenAPI, api.chainId)
      const tokenSupplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: tokens})
      api.addTokens(tokens, tokenSupplies)
      return api.getBalances()
    }
  }
};
