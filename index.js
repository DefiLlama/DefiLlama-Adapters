const { staking } = require('../helper/staking')
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')
const {transformHarmonyAddress} = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')

const treasury = "0x1A9Be7D6f94D3Ba8c37568E08D8D8780AAD128E6"

async function tvl(time, ethBlock, chainBlocks){
    const balances = {}
    const transform = await transformHarmonyAddress()
    const block = await getBlock(time, "harmony", chainBlocks, true)
    await sumTokensAndLPsSharedOwners(balances, [
        ["0xb8f4c06dd0c2f9eb5e67b4faa2d56ff3543d6765", true],
        ["0xef977d2f931c1978db5f6747666fa1eacb0d0339", false]
    ], [treasury], block, "harmony", transform)
    return balances
}

module.exports={
    harmony:{
        tvl,
        staking: staking("0x95066025af40F7f7832f61422802cD1e13C23753", "0x0dc78c79B4eB080eaD5C1d16559225a46b580694", "harmony")
    }
}