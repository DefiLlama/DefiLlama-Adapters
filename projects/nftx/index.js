const { gql } = require("graphql-request");
const { blockQuery } = require('../helper/graph')
const { getTokenPrices } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')

const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
async function tvl(_timestamp, block) {
  const { vaults } = await blockQuery(graphUrl, graphQuery, block, 100)
  const LPs = new Set(vaults.map(v => v.lpStakingPool.stakingToken.id))
  const tokens = new Set(vaults.map(v => v.token.id))

  const weth_balances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: Array.from(LPs).map(lp => ({
      target: weth,
      params: lp
    })),
    block
  })

  const token_balances = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: Array.from(tokens).map(token => ({
      target: token,
    })),
    block
  })

  const balances = {}

  sdk.util.sumMultiBalanceOf(balances, token_balances)
  //sdk.util.sumMultiBalanceOf(balances, weth_balances)

  const lps = weth_balances.output
    .filter(({ output }) => +output > 2 * 1e18) // only pick pools with minimum 2 eth in it
    .map(({ input }) => input.params[0])

  const { updateBalances, prices } = await getTokenPrices({
    block, coreAssets: [weth], lps, allLps: true,
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
  console.table(print)
  console.log(print.reduce((a, i) => a + i.val, 0))

  updateBalances(balances)

  return balances
}

module.exports = {
  methodology: "Counts total value of all vaults",
  ethereum: { tvl }
}

const graphUrl = "https://api.thegraph.com/subgraphs/name/nftx-project/nftx-v2"
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