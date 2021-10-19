const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {

        const res = retry(async bail =>  await axios.post("https://api.thegraph.com/subgraphs/name/hurricaneswap/exchange", {
          query: `{
            pancakeFactories(first: 5) {
              id
              totalLiquidityUSD
            }
          }`,
          variables: null
        }));

        const singelToken = retry(async bail => await axios.post("https://api.thegraph.com/subgraphs/name/hurricaneswap/farm", {
          query: `{
            pools(where: {id: "0"}){
              entryUSD
              exitUSD
            }
          }
          `,
          variables: null
        }));
        const xHCT =  retry(async bail =>  await axios.post("https://api.thegraph.com/subgraphs/name/hurricaneswap/farm", {
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
    const pairLq = res?.data?.data?.pancakeFactories[0]['totalLiquidityUSD']
    const SingleFarm = singelToken?.data?.data?.pools[0]['entryUSD'] - singelToken?.data?.data?.pools[0]['exitUSD']
    const t = ratio?.data?.data?.bars[0].ratio
    const hctprice = price?.data?.data?.tokens[0]?.derivedUSD 
    const xHCTTvl = (xHCT?.data?.data?.pools[0]['slpDeposited'] - xHCT?.data?.data?.pools[0]['slpWithdrawn']) * hctprice * t 
    const tvl = Number(pairLq) + SingleFarm + xHCTTvl 

  return tvl;
}

module.exports = {
  fetch
}