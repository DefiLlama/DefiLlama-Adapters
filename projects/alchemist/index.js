const utils = require('../helper/utils')

const pool2s = [
    "0xf0D415189949d913264A454F57f4279ad66cB24d", // Aludel v1
    "0x93c31fc68E613f9A89114f10B38F9fd2EA5de6BC" // Aludel v1.5
]
const endpoint = "https://crucible.alchemist.wtf/api/get-program-rewards-usd?network=1"

function get(includePool2){
return async function() {
    const rewardPrograms = await utils.fetchURL(endpoint)
    return Object.entries(rewardPrograms.data).reduce((t, c)=>{
        let isPool2 = pool2s.some(p=>p.toLowerCase()===c[0].toLowerCase())
        if(includePool2){
            isPool2 = !isPool2 
        }
        if(isPool2){
            return t
        }
        return t+c[1]
    }, 0)
}
}

module.exports={
    methodology: 'Tvl equals the sum of the tokens locked on all rewards programs except their own (aludels). Aludels are counted as pool2',
    fetch: get(false),
    pool2:{
        fetch: get(true)
    }
}