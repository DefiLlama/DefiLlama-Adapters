const { usdCompoundExports } = require('../helper/compound')
const sdk = require('@defillama/sdk')


const unitroller = '0xcffef313b69d83cb9ba35d9c0f882b027b846ddc'

const lendingMarket = usdCompoundExports(unitroller, "moonriver", "0x455D0c83623215095849AbCF7Cc046f78E3EDAe0")



module.exports = {
    methodology: "Liquidity on DEX and supplied and borrowed amounts found using the comptroller address(0xcffef313b69d83cb9ba35d9c0f882b027b846ddc)",
    misrepresentedTokens: true,
    moonriver: {
        tvl: lendingMarket.tvl,
        borrowed: lendingMarket.borrowed
    }
}