const {getCompoundV2Tvl} = require('../helper/compound')
const {transformFantomAddress} = require('../helper/portedTokens')

async function tvl(...params) {
    const transformAdress= await transformFantomAddress()
    const balances = await getCompoundV2Tvl("0x260e596dabe3afc463e75b6cc05d8c46acacfb09", "fantom", addr=>{
        if(addr === "0xAd84341756Bf337f5a0164515b1f6F993D194E1f"){
            return "0x0000000000085d4780b73119b644ae5ecd22b376"
        }
        return transformAdress(addr)
    })(...params)
    return Object.fromEntries(Object.entries(balances).filter(b=>Number(b[1])>1))
}

module.exports={
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets. fUSD is returned as TUSD",
    tvl
}
