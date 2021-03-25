const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const abi = require('./abi.json')
const {unwrapCrv, unwrapUniswapLPs} = require('../helper/unwrapLPs')

const graphUrl = 'https://api.thegraph.com/subgraphs/name/axejintao/delta-dao'
const graphQuery = gql`
query GET_VAULTS($block: Int) {
  vaults(
    block: { number: $block }
  ) {
    id
    name
    token {
      id
    }
  }
}
`;

async function tvl(timestamp, block) {
  let balances = {};

  const {vaults} = (await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  )) //.filter(vault=>!vault.name.startsWith('DELTA'))

  const lockedTokens = (await sdk.api.abi.multiCall({
    abi: abi['underlyingBalanceWithInvestment'],
    calls: vaults.map(vault=>({
      target: vault.id
    })),
    block
  })).output
  const lpPositions = []
  await Promise.all(lockedTokens.map(async call=>{
    const vault = vaults.find(vault=>vault.id===call.input.target.toLowerCase());
    const underlyingTokenBalance = call.output
    if(vault.name.endsWith('3Crv')){
      await unwrapCrv(balances, vault.token.id, underlyingTokenBalance, block)
    } else if(vault.name.endsWith('SLP')){
      lpPositions.push({
        token: vault.token.id,
        balance: underlyingTokenBalance
      })
    } else {
      sdk.util.sumSingleBalance(balances, vault.token.id, underlyingTokenBalance)
    }
  }))
  await unwrapUniswapLPs(balances, lpPositions, block)
  return balances
}
  

module.exports = {
  name: 'Force DAO',
  token: '-',
  category: 'Yield',
  start: 0, // WRONG!
  tvl
}