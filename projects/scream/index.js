const {getCompoundV2Tvl} = require('../helper/compound')
const {transformFantomAddress} = require('../helper/portedTokens')

async function tvl(...params) {
    const transformAdress= await transformFantomAddress()
    const balances = await getCompoundV2Tvl("0x260e596dabe3afc463e75b6cc05d8c46acacfb09", "fantom", transformAdress)(...params)
    return Object.fromEntries(Object.entries(balances).filter(b=>Number(b[1])>1))
}

module.exports={
    tvl
}