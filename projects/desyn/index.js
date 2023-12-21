const axios = require('axios')
const { sumTokensExport } = require("../helper/unwrapLPs");


const pools_url = 'https://api.desyn.io/etf/defillama/pools'

async function tvl() {
    const pools = await getStbtItem()
    const owners = [];
    const lpPositions = [];
    for (let i = 0; i < pools.length; i++) {
      let tokens =  pools[i].tokens;
      owners.push(pools[i].pool_id)
      for(let j = 0; j< tokens.length; j++) {
        lpPositions.push(tokens[j]);
      }
    }
    return sumTokensExport({ 
        owners: owners,
        tokens: lpPositions,
      })
}

async function getStbtItem() {
    let dstbt = [];
    const poolLists  = (await axios.get(pools_url)).data.data.pools
    poolLists.map((pool) => {    
      if(pool.pool_type == 1) {
        dstbt.push(pool)
      }
    })

    return dstbt
}


module.exports = {
    methodology: 'RWA STBT is an investment portfolio that focuses on US short-term treasury bond digital assets and operates in a fully decentralized manner.',
    ethereum: {
      tvl:  tvl
    }
}
