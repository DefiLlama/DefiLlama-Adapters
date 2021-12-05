const {getCompoundV2Tvl} = require('../helper/compound')
const {transformAvaxAddress, fixAvaxBalances} = require('../helper/portedTokens')
const {pool2} = require('../helper/pool2')

async function tvl(...params) {
    const transformAdress= await transformAvaxAddress()
    const balances = await getCompoundV2Tvl("0x486af39519b4dc9a7fccd318217352830e8ad9b4", "avax", transformAdress)(...params)
    return balances
}

module.exports={
    timetravel: true,
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
    avalanche:{
        tvl: getCompoundV2Tvl("0x486af39519b4dc9a7fccd318217352830e8ad9b4", "avax", addr=>`avax:${addr}`, undefined, undefined),
        borrowed: getCompoundV2Tvl("0x486af39519b4dc9a7fccd318217352830e8ad9b4", "avax", addr=>`avax:${addr}`, undefined, undefined, true),
        pool2: pool2("0x784da19e61cf348a8c54547531795ecfee2affd1", "0xe530dc2095ef5653205cf5ea79f8979a7028065c", "avax")
    }
}
