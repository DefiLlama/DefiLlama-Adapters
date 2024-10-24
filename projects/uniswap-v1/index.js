const { nullAddress } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk")

const uniFactory = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'

const abi = {
  getExchange: "function getExchange(address token) view returns (address)",
  getTokenWithId: "function getTokenWithId(uint256 token_id) view returns (address)",
  tokenCount: "function tokenCount() view returns (uint256)",
}

const tvl = async (api) => {
  const tokens = (await api.fetchList({ lengthAbi: abi.tokenCount, itemAbi: abi.getTokenWithId, target: uniFactory })).filter((token) => token !== nullAddress)
  const pools = await api.multiCall({ calls: tokens.map((token) => ({ target: uniFactory, params: [token] })), abi: abi.getExchange })
  const balanceOfs = await api.multiCall({ calls: pools.map((pool, i) => ({ target: tokens[i], params: [pool] })), abi: 'erc20:balanceOf', permitFailure: true })

  await Promise.all(
    pools.map(async (pool, i) => {
      const token = tokens[i]
      const balance = balanceOfs[i]
      if (!token || !balance || balance == 0) return // to ensure that there is still collateral in place
      api.add(nullAddress, (await sdk.api.eth.getBalance({ target: pool })).output * 2) // Since Uniswap V1 only allowed swaps against ETH, it's enough to know the amount of ETH and multiply it by two to determine the pool's value without needing to know the price of the collateral in question
    })
  )
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens in ETH value locked in AMM pools`,
  ethereum: { tvl }
}