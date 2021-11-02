const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const abi =require('./abi.json')

const oldVaultFactory = "0xBe54738723cea167a76ad5421b50cAa49692E7B7"

async function tvl(_timestamp, block){
  const vaults = await request(graph, query, {
    block
  })
  const vaultSet = new Set(vaults.vaults.map(v=>v.token.id));
  const poolLength = await sdk.api.abi.call({
    target: oldVaultFactory,
    block,
    abi:abi.vaultsLength
  })

  const oldVaults = await sdk.api.abi.multiCall({
    abi: abi.xToken,
    calls: Array.from(Array(Number(poolLength.output)).keys()).map(i=>({
      target: oldVaultFactory,
      params: [i]
    })),
    block
  })
  oldVaults.output.forEach(s=>vaultSet.add(s.output))
  const supplies = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: Array.from(vaultSet).map(t=>({target: t})),
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
      asset {
        id
        name
        symbol
      }
    }
  }
`