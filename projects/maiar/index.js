const { request, gql } = require("graphql-request");
const {toUSDTBalances} = require('../helper/balances')

const LiquidityQuery= gql`
{
    farms {
      farmingToken {
        identifier
      }
      farmTokenPriceUSD
      farmingTokenReserve
    }
    pairs {
      firstToken {
        decimals
      }
      secondToken {
        decimals
      }
      firstTokenPriceUSD
      secondTokenPriceUSD
      info {
        reserves0
        reserves1
      }
    }
  }
  
`

async function tvl(){
    const {pairs} = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)
    const totalTvl = pairs.reduce((total, pair)=>{
        if(pair.firstTokenPriceUSD === "NaN" || pair.secondTokenPriceUSD === "NaN"){
            return total
        }
        return total 
        + (pair.firstTokenPriceUSD * pair.info.reserves0 / (10**(pair.firstToken.decimals)))
        + (pair.secondTokenPriceUSD * pair.info.reserves1 / (10**(pair.secondToken.decimals))) 
    }, 0)
    return toUSDTBalances(totalTvl)
}

async function staking(){
    const data = await request("https://graph.maiar.exchange/graphql", LiquidityQuery)
    const mexFarm = data.farms.find(f=>f.farmingToken.identifier === "MEX-455c57")
    return toUSDTBalances(mexFarm.farmTokenPriceUSD*mexFarm.farmingTokenReserve/1e18)
}


module.exports={
  misrepresentedTokens: true,
  timetravel: false,
    elrond:{
        tvl,
        staking
    },
}