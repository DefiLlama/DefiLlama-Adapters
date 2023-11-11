const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const fan_contract = "0x9842114F1d9c5286A6b8e23cF0D8142DAb2B3E9b"
const touch_contract = "0xC612eD7a1FC5ED084C967bD71F1e0F0a338Cf816"

async function tvl(time, ethBlock, _b, { api }) {
    return  sumTokens2({ tokens: [nullAddress], owners: [fan_contract,touch_contract], api })
   
}

module.exports = {
    methodology: `We count the ETH on ${fan_contract} and ${touch_contract}`,
    era: {
        tvl
    }
}