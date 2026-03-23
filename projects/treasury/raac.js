const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

// treasury tokens usdc, crvUsd,CRV,CVX, ION_AU_Token
const ionAUAddress = "0xd051c326C9Aef673428E6F01eb65d2C52De95D30"
const pmUSDAddress = "0xC0c17dD08263C16f6b64E772fB9B723Bf1344DdF"
const xPMAddress = "0x75939CEb9FBa27A545fE27d1CBd228c29123687c"
const usdcAddress = ADDRESSES.ethereum.USDC
const crvUsdAddress = ADDRESSES.ethereum.CRVUSD
const crvAddress = ADDRESSES.ethereum.CRV
const cvxAddress = ADDRESSES.ethereum.CVX

const tokens = [
    ionAUAddress,
    pmUSDAddress,
    xPMAddress,
    usdcAddress,
    crvUsdAddress,
    crvAddress,
    cvxAddress
]


module.exports = treasuryExports({
    ethereum: {
        tokens,
        owners: ["0x5aD30fcA5A031c850b817f6F4dE1EE2D713EF850"],
        ownTokens: [xPMAddress, pmUSDAddress],
        fetchCoValentTokens: false
    }
})