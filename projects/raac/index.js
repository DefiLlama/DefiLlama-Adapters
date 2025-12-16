const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const TREASURY_ADDRESS = "0x5aD30fcA5A031c850b817f6F4dE1EE2D713EF850"
// treasury tokens usdc, crvUsd,CRV,CVX, ION_AU_Token

const ionAUAddress = "0xd051c326C9Aef673428E6F01eb65d2C52De95D30"
const usdcAddress = ADDRESSES.ethereum.USDC
const crvUsdAddress = ADDRESSES.ethereum.CRVUSD
const crvAddress = ADDRESSES.ethereum.CRV
const cvxAddress = ADDRESSES.ethereum.CVX

const treasuryTokens = [
    ionAUAddress,
    usdcAddress,
    crvUsdAddress,
    crvAddress,
    cvxAddress
]
async function treasury(api) {
    return sumTokens2({
        api,
        owner: TREASURY_ADDRESS,
        token: treasuryTokens
    })
}

module.exports = {
    methodology: 'Counts ION.AU held in the RAAC treasury address.',
    ethereum: {
        treasury
    },
}