const pinyottasContract = '0x2861e4d8e26b10029e5cd1d236239f810c664b99'

const abi = {
  getTokenContractsInPinyotta: "function getTokenContractsInPinyotta(uint256 _id) view returns (address[] tokenContracts)",
}

async function tvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'totalSupply', itemAbi: abi.getTokenContractsInPinyotta, target: pinyottasContract, startFromOne: true })
  return api.sumTokens({ tokens: tokens.flat(), owner: pinyottasContract, })
}

module.exports = {
  methodology: `Pinyottas are ERC-721 contracts which hold a given amount of ERC20 token. Get pinyottas count, then for each, get contract of token held in the pinyotta and amount (which is zero if pinyotta has been busted so tokens were retrieved)`,
  ethereum: { tvl }
}