const {getCompoundV2Tvl} = require('../helper/compound')
const {transformAvaxAddress} = require('../helper/portedTokens')

async function tvl(...params) {
    const transformAdress= await transformAvaxAddress()
    const balances = await getCompoundV2Tvl("0x486af39519b4dc9a7fccd318217352830e8ad9b4", "avax", transformAdress)(...params)
    balances['avalanche-2'] = Number(balances['0x9dEbca6eA3af87Bf422Cea9ac955618ceb56EfB4'])/1e18
    delete balances['0x9dEbca6eA3af87Bf422Cea9ac955618ceb56EfB4']
    return balances
}

module.exports={
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
    tvl
}
