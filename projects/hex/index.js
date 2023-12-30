const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const abi = require('./abi.json')

const HEX = ADDRESSES.pulse.HEX
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