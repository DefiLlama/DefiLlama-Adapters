const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const { transformFantomAddress } = require('../helper/portedTokens')


const treasury = "0x8CFA87aD11e69E071c40D58d2d1a01F862aE01a8"

async function tvl(time, ethBlock, chainBlocks) {
    const balances = {}
    const transform = await transformFantomAddress()
    await sumTokensAndLPsSharedOwners(balances, [
        [ADDRESSES.fantom.DAI, false],
        [ADDRESSES.fantom.WFTM, false], // FTM asset
        ["0xfa5a5f0bc990be1d095c5385fff6516f6e03c0a7", true]
    ], [treasury], chainBlocks.fantom, "fantom", transform)
    return balances
}

module.exports = {
    fantom: {
        tvl,
        staking: staking("0x9863056B4Bdb32160A70107a6797dD06B56E8137", "0x5602df4A94eB6C680190ACCFA2A475621E0ddBdc", "fantom")
    }
}