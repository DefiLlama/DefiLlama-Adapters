const { getAdaInAddress } = require('../helper/chain/cardano')

async function tvl(){
    const ammLocked = await getAdaInAddress("addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu")
    const orderBookLocked = await getAdaInAddress("addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8")
    return {
        "cardano": ammLocked * 2 + orderBookLocked
    }
}

module.exports={
    timetravel: false,
    cardano:{
        tvl
    }
}
