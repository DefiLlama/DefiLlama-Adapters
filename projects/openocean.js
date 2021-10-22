const utils = require('./helper/utils')

const api = "http://market-api.openocean.finance/v2/market"

function getPartTvl(name){
    return async ()=>{
        const data = await utils.fetchURL(api)
        return Number(data.data.find(d=>d.name === name).value)
    }
}

module.exports={
    staking:{
        fetch: getPartTvl("STAKED")
    },
    pool2:{
        fetch: getPartTvl("POOL2")
    },
        fetch: getPartTvl("BSC TVL")
}