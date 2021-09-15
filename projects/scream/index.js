const {getCompoundV2Tvl} = require('../helper/compound')
const {transformFantomAddress} = require('../helper/portedTokens')
const {staking} = require('../helper/staking')

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
    staking:{
        tvl: staking("0xe3d17c7e840ec140a7a51aca351a482231760824", "0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475", "fantom")
    },
    tvl
}
