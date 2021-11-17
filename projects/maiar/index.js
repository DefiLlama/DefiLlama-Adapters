const { request, gql } = require("graphql-request");
const {toUSDTBalances} = require('../helper/balances')

const LiquidityQuery= gql`
{
    totalLockedValueUSDFarms
    totalValueLockedUSD
    farms {
      address
      APR
      farmingToken {
        name
        identifier
        decimals
        __typename
      }
      farmTokenPriceUSD
      farmedTokenPriceUSD
      farmingTokenPriceUSD
      farmingTokenReserve
      perBlockRewards
      penaltyPercent
      __typename
    }
    pairs {
      address
      firstToken {
        name
        identifier
        decimals
        __typename
      }
      secondToken {
        name
        identifier
        decimals
        __typename
      }
      firstTokenPrice
      firstTokenPriceUSD
      secondTokenPrice
      secondTokenPriceUSD
      liquidityPoolTokenPriceUSD
      info {
        reserves0
        reserves1
        totalSupply
        __typename
      }
      __typename
    }
  }
  
`

async function tvl(){
    const {pairs} = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)
    const totalTvl = pairs.reduce((total, pair)=>{
        if(pair.liquidityPoolTokenPriceUSD === "NaN"){
            return total
        }
        return total + (pair.liquidityPoolTokenPriceUSD * pair.info.totalSupply /1e18)
    }, 0)
    return toUSDTBalances(totalTvl)
}

async function staking(){
    const data = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)
    const mexFarm = data.farms.find(f=>f.farmingToken.identifier === "MEX-455c57")
    return toUSDTBalances(mexFarm.farmTokenPriceUSD*mexFarm.farmingTokenReserve/1e18)
}


module.exports={
    elrond:{
        tvl,
        staking
    },
}