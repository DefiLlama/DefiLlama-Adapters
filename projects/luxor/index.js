const { stakingPricedLP } = require('../helper/staking')
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')
const {transformFantomAddress} = require('../helper/portedTokens')


const treasury = "0xDF2A28Cc2878422354A93fEb05B41Bd57d71DB24"
const LUX = "0x6671e20b83ba463f270c8c75dae57e3cc246cb2b"

async function tvl(time, ethBlock, chainBlocks){
    const balances = {}
    const transform = await transformFantomAddress()
    await sumTokensAndLPsSharedOwners(balances, [
        ["0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", false],
        ["0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", false],
        ["0x46729c2AeeabE7774a0E710867df80a6E19Ef851", true]
    ], [treasury], chainBlocks.fantom, "fantom", transform)
    return balances
}

module.exports={
    fantom:{
        tvl,
        staking: stakingPricedLP("0xf3F0BCFd430085e198466cdCA4Db8C2Af47f0802", LUX, "fantom", "0x46729c2AeeabE7774a0E710867df80a6E19Ef851", "dai", true)
    }
}
