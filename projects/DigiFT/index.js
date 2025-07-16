const sdk = require('@defillama/sdk');
const { getLogs2 } = require('../helper/cache/getLogs')
//Polygon FeedPrice contract address
const DFeedPriceAddress = "0x7d4d68f18d1be3410ab8d827fb7ebc690f938d2d"
const tokenListAbi = "function getAllTokenRecords() view returns (tuple(uint256 chainId, address tokenAddress, uint64 tokenType)[])"
const uMintAddress = '0xC06036793272219179F846eF6bfc3B16E820Df0B'
const ULTRAAddress = '0x50293dd8889b931eb3441d2664dce8396640b419'
const BurnAbi = "event Burn (address indexed from, uint256 value, string data)"
const MintAbi = "event Mint (address indexed to, uint256 amount)"
const SubRedManagement = '0x3797c46db697c24a983222c335f17ba28e8c5b69'
async function getTokenList(tokenAPI, chainId) {
  return (await tokenAPI.call({
    target: DFeedPriceAddress,
    abi: tokenListAbi
  })).filter(item => item[0] == chainId && item[2] == '1').map(item => item[1]).filter(address => address.toLowerCase() !== uMintAddress.toLowerCase());
}
 
module.exports = {
  ethereum: {
    tvl: async (api) => {
      const tokenAPI = new sdk.ChainApi({ chain: 'polygon', timestamp: api.timestamp, });
      const tokens = await getTokenList(tokenAPI, api.chainId)
      const tokenSupplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: tokens})
      api.addTokens(tokens, tokenSupplies)
      api.removeTokenBalance(ULTRAAddress)
      api.removeTokenBalance(uMintAddress)
      //uMint amount
      const BurnAmount = (await getLogs2({ api, target: uMintAddress, eventAbi: BurnAbi, fromBlock: 21091537, extraKey: 'Burn-key' })).filter(log => log[0].toLowerCase() === SubRedManagement)
        .reduce((sum, log) => sum + log[1], 0n);
      const MintAmount = (await getLogs2({ api, target: uMintAddress, eventAbi: MintAbi, fromBlock: 21091537, extraKey: 'Mint-key' })).filter(log => log[0].toLowerCase() === SubRedManagement)
        .reduce((sum, log) => sum + log[1], 0n);
      api.addToken(uMintAddress, MintAmount - BurnAmount)
      return api.getBalances()
    }
  },
  arbitrum: {
    tvl: async (api) => {
      const tokenAPI = new sdk.ChainApi({ chain: 'polygon', timestamp: api.timestamp, });
      const tokens = await getTokenList(tokenAPI, api.chainId)
      const tokenSupplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: tokens})
      api.addTokens(tokens, tokenSupplies)
      return api.getBalances()
    }
  }
};
