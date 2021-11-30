const { aaveChainTvl} = require('../helper/aave')
const { transformAvaxAddress } = require('../helper/portedTokens')

async function tvl(timestamp, ethBlock, chainBlocks) {
    const transform = await transformAvaxAddress()
    return  aaveChainTvl("avax", "0xfF50b540c9152F1841edF47b49dA69696Be59783", transform)(timestamp, ethBlock, chainBlocks)
}

module.exports={
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
    tvl
}
