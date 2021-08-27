const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')

async function tvl(_timestamp, block){
  const vaults = await request(graph, query, {
    block
  })
  const supplies = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: vaults.vaults.map(v=>({
      target: v.token.id
    })),
    block
  })
  const balances = {}
  sdk.util.sumMultiBalanceOf(balances, supplies)
  return balances
}

module.exports = {
  methodology: "Counts total value of all vaults",
  tvl
}

const graph = "https://api.thegraph.com/subgraphs/name/nftx-project/nftx-v2"
const query = gql`
query get_vaults($block: Int) {
    vaults(first: 1000, where: { 
      vaultId_gte: 0
    },
      block: { number: $block }  
    ) {
      vaultId
      id
      is1155
      isFinalized
      totalHoldings
      totalMints
      totalRedeems
      holdings(first: 1000) {
        id
        tokenId
        amount
      }
      token {
        id
        name
        symbol
      }
      fees {
        mintFee
        randomRedeemFee
        targetRedeemFee
        swapFee
      }
      asset {
        id
        name
        symbol
      }
      manager {
        id
      }
      createdBy {
        id
      }
      eligibilityModule {
        id
        eligibleIds
        eligibleRange
      }
      features {
        enableMint
        enableRandomRedeem
        enableTargetRedeem
        enableSwap
      }
    }
  }
`