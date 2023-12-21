const axios = require('axios')

const pools_url = 'https://api.desyn.io/etf/defillama/pools'

async function tvl() {
    const pools = await getStbtItem()
    let totals = 0;
    for (let i = 0; i < pools.length; i++) {
      let tokens =  pools[i].tokens;     
      for(let j = 0; j< tokens.length; j++) {
        totals += Number(tokens[j].balance) 
      }
    }

    return totals
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
