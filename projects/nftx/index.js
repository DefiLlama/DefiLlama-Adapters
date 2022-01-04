const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')

const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
async function tvl(_timestamp, block){
  const {vaults} = await request(graphUrl, graphQuery, {block})
  const LPs = new Set(vaults.map(v=>v.lpStakingPool.stakingToken.id))
  // oldvaults excluded

  const weth_balances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: Array.from(LPs).map(lp => ({
      target: weth, 
      params: lp
    })),
    block
  })

  const balances = {}
  sdk.util.sumMultiBalanceOf(balances, weth_balances)
  return balances
}

const oldVaultFactory = "0xBe54738723cea167a76ad5421b50cAa49692E7B7"

module.exports = {
  methodology: "Counts total value of all vaults",
  tvl: tvl
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