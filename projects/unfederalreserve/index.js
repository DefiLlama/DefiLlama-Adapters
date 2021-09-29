const {getCompoundV2Tvl} = require('../helper/compound')

async function tvl(...params) {
    return getCompoundV2Tvl("0x3105D328c66d8d55092358cF595d54608178E9B5", "ethereum", a=>a, "0xFaCecE87e14B50eafc85C44C01702F5f485CA460", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")(...params)
}

module.exports={
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
    tvl
}
