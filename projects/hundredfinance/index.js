const {getCompoundV2Tvl} = require('../helper/compound')
const {transformArbitrumAddress, transformFantomAddress} = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

const comptroller = "0x0f390559f258eb8591c8e31cf0905e97cf36ace2"

async function arb(time, block, chainBlocks){
    const transform = await transformArbitrumAddress()
    return getCompoundV2Tvl(comptroller, "arbitrum", transform, "0x8e15a22853A0A60a0FBB0d875055A8E66cff0235", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1")(time, block, chainBlocks)
}
async function fantom(time, block, chainBlocks){
    const transform = await transformFantomAddress()
    return getCompoundV2Tvl(comptroller, "fantom", transform, "0xfCD8570AD81e6c77b8D252bEbEBA62ed980BD64D", "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83")(time, block, chainBlocks)
}


const eth = getCompoundV2Tvl(comptroller, "ethereum", id=>id, "0xfCD8570AD81e6c77b8D252bEbEBA62ed980BD64D")

module.exports={
    ethereum:{tvl:eth},
    arbitrum:{tvl:arb},
    fantom:{tvl:fantom},
}