const { nullAddress } = require('../helper/unwrapLPs')

const uniFactory = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'

const abi = {
  getExchange: "function getExchange(address token) view returns (address)",
  getTokenWithId: "function getTokenWithId(uint256 token_id) view returns (address)",
  tokenCount: "function tokenCount() view returns (uint256)",
}

const tvl = async (api) => {
  let pools = await api.fetchList({ lengthAbi: abi.tokenCount, itemAbi: abi.getTokenWithId, target: uniFactory, itemAbi2: abi.getExchange, })
  pools = pools.filter(i => i !== nullAddress)
  await api.sumTokens({ owners: pools, tokens: [nullAddress] })
  const balancesV2 = api.getBalancesV2()
  return balancesV2.clone(2).getBalances() // // Since Uniswap V1 only allowed swaps against ETH, it's enough to know the amount of ETH and multiply it by two to determine the pool's value without needing to know the price of the collateral in question
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens in ETH value locked in AMM pools`,
  ethereum: { tvl }
}