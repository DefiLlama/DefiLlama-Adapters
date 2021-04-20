const axios = require('axios')

async function fetch(){
    let tvl = 0;
    const pools = await axios.get('https://serum-api.bonfida.com/pools')
    console.log(pools.data)
    pools.data.data.forEach(pool=>{
        let liquidity = pool.liquidityAinUsd
        if(liquidity == 0){
            liquidity = pool.liquidityBinUsd
        }
        tvl += liquidity*2
    })
    return tvl
}

module.exports = {
    fetch
}