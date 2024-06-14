const ADDRESSES = require('../helper/coreAssets.json')
const { gql } = require("graphql-request");
const { blockQuery } = require('../helper/http')
const { getTokenPrices } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const { getChainTransform } = require('../helper/portedTokens')

const config = {
  ethereum: {
    weth: ADDRESSES.ethereum.WETH,
    graphUrl: 'https://graph-proxy.nftx.xyz/c/shared/subgraphs/name/nftx-project/nftx-v2-1-mainnet'
  },
  arbitrum: {
    weth: ADDRESSES.arbitrum.WETH,
    graphUrl: 'https://graph-proxy.nftx.xyz/shared/subgraphs/name/nftx-project/nftx-v2-arbitrum'
  },
}
function getTvl(chain) {
  const { weth, graphUrl } = config[chain]
  return async (api) => {
    const { vaults } = await blockQuery(graphUrl, graphQuery, { api })
    const block = api.block
    const LPs = new Set(vaults.map(v => v.lpStakingPool.stakingToken.id))
    const tokens = new Set(vaults.map(v => v.token.id))
    const transform = await getChainTransform(chain)

    const weth_balances = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: Array.from(LPs).map(lp => ({
        target: weth,
        params: lp
      })),
      block, chain,
    })

    const token_balances = await sdk.api.abi.multiCall({
      abi: 'erc20:totalSupply',
      calls: Array.from(tokens).map(token => ({
        target: token,
      })),
      block, chain,
    })

    const balances = {}

    sdk.util.sumMultiBalanceOf(balances, token_balances)
    //sdk.util.sumMultiBalanceOf(balances, weth_balances)

    const lps = weth_balances.output
      .filter(({ output }) => +output > 2 * 1e18) // only pick pools with minimum 2 eth in it
      .map(({ input }) => input.params[0])

    const { updateBalances, prices } = await getTokenPrices({
      block, useDefaultCoreAssets: true, lps, allLps: true, chain,
    })

    const print = []
    vaults.forEach(vault => {
      const price = prices[vault.token.id]
      const balance = (balances[vault.token.id] || 0) / 1e18
      if (!price || !balance) return;
      const total = balance * price[1]
      if (total < 50) return;
      print.push({ id: vault.token.id, balance, name: vault.token.name, val: total })
    })
    print.sort((a, b) => b.val - a.val)

    updateBalances(balances)
    const transformedBalances = {}
    Object.entries(balances).forEach(([token, balance]) => sdk.util.sumSingleBalance(transformedBalances, transform(token), balance))

    return transformedBalances
  }
}

module.exports = {
  methodology: "Counts total value of all vaults",
  ethereum: { tvl: getTvl('ethereum') },
  arbitrum: { tvl: getTvl('arbitrum') },
}

const graphQuery = gql`
query get_vaults($block: Int) {
  vaults(
    first: 1000, 
    where: { vaultId_gte: 0 },
    block: { number: $block }  
  ) {
    vaultId
    id
    is1155
    isFinalized
    totalHoldings
    allocTotal
    token {
      id
      name
      symbol
    }
    asset {
      id
      name
      symbol
    }
    lpStakingPool {
      stakingToken {
        id
        name
        symbol
      }
      rewardToken{
        id
        name
        symbol
      }
    }
  }
}
`