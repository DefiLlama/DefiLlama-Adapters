const {fetchURL} = require('../helper/utils');

// Source: https://docs.loterra.io/resources/contract-addresses
const contracts = ["terra1e7hzp3tnsswpfcu6gt4wlgfm20lcsqqywhaagu", "terra1zcf0d95z02u2r923sgupp28mqrdwmt930gn8x5", "terra14mevcmeqt0n4myggt7c56l5fl0xw2hwa2mhlg0", "terra1q2k29wwcz055q4ftx4eucsq6tg9wtulprjg75w"]

async function tvl(){
    const tokens = await Promise.all(contracts.map(contract=>fetchURL(`https://fcd.terra.dev/v1/bank/${contract}`)))
    const total = tokens.map(data=>{
        const ust = data.data.balance.find(t=>t.denom === "uusd")
        if(ust === undefined){
            return 0
        }
        return Number(ust.available)
    })

    return {
        'terrausd': total.reduce((t, c)=>c+t)/1e6
    }
}

module.exports = {
    methodology: 'TVL counts the UST that is available as a prize on the protocol.',
    terra:{
        tvl
    },
    historical: false,
    tvl
}