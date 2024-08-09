const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/http')
const { transformBalances } = require("../helper/portedTokens");

const graphUrl = 'https://main-api.flow.movefuns.xyz/'
const graphQuery = gql`
query ExampleQuery {
  tvl {
    coin_type
    lock_amount
  }
}`
async function getTokenAmount() {
    const data  = await request(
      graphUrl,
      graphQuery, 
      {},
      {
       "x-auth-info":"123"
      }
    );
    console.log("data.tvl",data.tvl);
    return data.tvl
}

async function aptosTvl(api) {
  const coinContainers = await getTokenAmount();

  coinContainers.map((item)=>{
    api.add(item.coin_type, parseInt(item.lock_amount));
  })
}




module.exports = {
  aptos: {
    tvl: aptosTvl,
  },

};
