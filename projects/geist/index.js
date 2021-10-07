const { aaveChainTvl} = require('../helper/aave')
const { transformFantomAddress} = require('../helper/portedTokens')

async function tvl(timestamp, ethBlock, chainBlocks) {
    const transform = await transformFantomAddress()
    return  aaveChainTvl("fantom", "0x4CF8E50A5ac16731FA2D8D9591E195A285eCaA82", transform)(timestamp, ethBlock, chainBlocks)
}

module.exports={
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
    tvl
}
