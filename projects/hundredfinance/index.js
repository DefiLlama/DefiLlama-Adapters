const {compoundExports, compoundExportsWithAsyncTransform} = require('../helper/compound')
const {transformArbitrumAddress, transformFantomAddress, transformHarmonyAddress} = require('../helper/portedTokens')

const comptroller = "0x0f390559f258eb8591c8e31cf0905e97cf36ace2"

module.exports={
    ethereum:compoundExports(comptroller, "ethereum", "0xfCD8570AD81e6c77b8D252bEbEBA62ed980BD64D", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    arbitrum:compoundExportsWithAsyncTransform(comptroller, "arbitrum", "0x8e15a22853A0A60a0FBB0d875055A8E66cff0235", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", transformArbitrumAddress),
    fantom:compoundExportsWithAsyncTransform(comptroller, "fantom", "0xfCD8570AD81e6c77b8D252bEbEBA62ed980BD64D", "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", transformFantomAddress),
    hundred:compoundExportsWithAsyncTransform(comptroller, "harmony", "0xbb93C7F378B9b531216f9aD7b5748be189A55807", "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a", transformHarmonyAddress),
}
