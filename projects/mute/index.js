const { default: request, gql } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');

async function tvl(){
    const res = await request("https://graph.mute.io/subgraphs/name/mattt21/muteswitch_mainnet", gql`{
        muteSwitchFactories{
          totalLiquidityUSD
        }
      }`)
    return toUSDTBalances(res["muteSwitchFactories"][0].totalLiquidityUSD)
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    era: {
      tvl
    },
    methodology:
      "Counts liquidity in pools",
};