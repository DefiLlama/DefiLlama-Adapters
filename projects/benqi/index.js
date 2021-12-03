const {getCompoundV2Tvl} = require('../helper/compound')
const {transformAvaxAddress, fixAvaxBalances} = require('../helper/portedTokens')

async function tvl(...params) {
    const transformAdress= await transformAvaxAddress()
    const balances = await getCompoundV2Tvl("0x486af39519b4dc9a7fccd318217352830e8ad9b4", "avax", transformAdress)(...params)
    fixAvaxBalances(balances)
    return balances
}

module.exports={
    timetravel: true,
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
    tvl
}
