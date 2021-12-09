const sdk = require("@defillama/sdk")
const abi = require('./abi.json')

const HEX = "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39"
async function staking(timestamp, block){
    const globalInfo = await sdk.api.abi.call({
        target: HEX,
        block,
        abi: abi.globalInfo
    })
    return {
        [HEX]: globalInfo.output[0]
    }
}

module.exports={
    ethereum:{
        staking,
        tvl: ()=>({})
    }
}