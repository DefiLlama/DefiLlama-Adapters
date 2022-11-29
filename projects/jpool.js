const {getTokenSupply} = require('./helper/solana')

async function tvl(){
    const supply = await getTokenSupply("7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn")
    return {
        jpool: supply
    }
}

module.exports={
    timetravel: false,
    methodology: "JSOL total supply as it's equal to the SOL staked",
    solana:{
        tvl
    }
}