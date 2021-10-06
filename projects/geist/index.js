const { aaveChainTvl} = require('../helper/aave')
const { transformFantomAddress} = require('../helper/portedTokens')

async function tvl(timestamp, ethBlock, chainBlocks) {
    const transform = await transformFantomAddress()
    return  aaveChainTvl("fantom", "0x4CF8E50A5ac16731FA2D8D9591E195A285eCaA82", transform)(timestamp, ethBlock, chainBlocks)
}

module.exports={
    tvl
}