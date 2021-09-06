const {fetchURL} = require('../helper/utils');

async function tvl(){
    const tokens = await fetchURL('https://fcd.terra.dev/v1/bank/terra14mevcmeqt0n4myggt7c56l5fl0xw2hwa2mhlg0')

    return {
        'terrausd': Number(tokens.data.balance.find(t=>t.denom === "uusd").available)/1e6
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