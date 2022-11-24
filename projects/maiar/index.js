const { default: axios } = require("axios");
const { request, gql } = require("graphql-request");
const {toUSDTBalances} = require('../helper/balances')

const LiquidityQuery= gql`
{
    factory {
      pairCount
      totalValueLockedUSD
    }
  }
  
`

async function tvl(){
    const results = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)

    return toUSDTBalances(results.factory.totalValueLockedUSD)
}

const stakingContracts = [
  "erd1qqqqqqqqqqqqqpgq7qhsw8kffad85jtt79t9ym0a4ycvan9a2jps0zkpen",
  "erd1qqqqqqqqqqqqqpgqv4ks4nzn2cw96mm06lt7s2l3xfrsznmp2jpsszdry5"
]
async function staking(){
  let mexTvl = 0
  await Promise.all(stakingContracts.map(async owner=>{
    const data = await axios.get(`https://api.elrond.com/accounts/${owner}/tokens/MEX-455c57`)
    mexTvl += data.data.balance/1e18
  }))
  return {
    "maiar-dex": mexTvl
  }
}


module.exports={
  misrepresentedTokens: true,
  timetravel: false,
    elrond:{
        tvl,
        staking
    },
}