const retry = require('async-retry')
const axios = require("axios");
const { toUSDTBalances } = require('./helper/balances');
const {getChainTvl} = require('./helper/getUniSubgraphTvl')

async function staking() {
  const xHCT = retry(async bail => await axios.post("https://api.thegraph.com/subgraphs/name/hurricaneswap/farm", {
    query: `{
      pools(where: {id: "8"}){
        slpDeposited
        slpWithdrawn
      }
    }
    `,
    variables: null
  }));

  const price = retry(async bail => await axios.post("https://api.thegraph.com/subgraphs/name/hurricaneswap/exchange", {
    query: `{
          tokens(where:{
            id:"0x45c13620b55c35a5f539d26e88247011eb10fdbd"
          }){
            id
            symbol
            derivedUSD
           
          }
        }`,
    variables: null
  }));
  const ratio = retry(async bail => await axios.post("https://api.thegraph.com/subgraphs/name/hurricaneswap/bar", {
    query: `{
      bars(first: 5) {
        id
        ratio
      }
    }
    `,
    variables: null
  }));
  const t = ratio?.data?.data?.bars[0].ratio
  const hctprice = price?.data?.data?.tokens[0]?.derivedUSD
  const xHCTTvl = (xHCT?.data?.data?.pools[0]['slpDeposited'] - xHCT?.data?.data?.pools[0]['slpWithdrawn']) * hctprice * t
  return toUSDTBalances(xHCTTvl)
}

const liquidityTvl = getChainTvl({
  'avax': "https://api.thegraph.com/subgraphs/name/hurricaneswap/exchange"
}, "pancakeFactories")

module.exports = {
  misrepresentedTokens: true,
  avalanche: {
    tvl: liquidityTvl('avax'),
    //staking
  },
}