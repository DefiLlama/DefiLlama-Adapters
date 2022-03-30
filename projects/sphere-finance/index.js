const sdk = require("@defillama/sdk")
const { ohmTvl } = require('../helper/ohm')

function ohmTvlMultiTreasuries(treasuries, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix = id=>id, tokenOnCoingecko = true) {
    // Accumulate tvl for multiple treasuries, executing simply ohmTvl
    const tvl_per_treasury = treasuries.map(treasury => 
        ohmTvl(treasury, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix, tokenOnCoingecko)
    )
    
    // Edit TVL of object to be the cumulative tvl
    const tvl_object = tvl_per_treasury[0]
    const tvls = tvl_per_treasury.map(o => o[chain === "avax"?"avalanche":chain].tvl)
    tvl_object[chain === "avax"?"avalanche":chain].tvl = sdk.util.sumChainTvls(tvls)
    return tvl_object
}

const sphere_token = "0x8D546026012bF75073d8A586f24A5d5ff75b9716"
const treasuries = ["0x1a2ce410a034424b784d4b228f167a061b94cff4", "0x826b8d2d523e7af40888754e3de64348c00b99f4", "0x20d61737f972eecb0af5f0a85ab358cd083dd56a" ]
const stakingAddress = "0x0000000000000000000000000000000000000000" // NONE
const treasuryTokens = [
    // ["0x8D546026012bF75073d8A586f24A5d5ff75b9716", false], // SPHERE, remove as it is the collateralized token
    ["0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", false], // WMATIC
    ["0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", false], // miMATIC
    ["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", false], // USDC
    ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", false], // USDT
    ["0xf305242c46cfa2a07965efbd68b167c99173b496", true], // WMATIC/SPHERE, needs to account only half of it

    ["0xeE3B4Ce32A6229ae15903CDa0A5Da92E739685f7", false], // xIRON_LOAN_USDC
    ["0xeF7B706cA139dBd9010031a50de5509D890CE527", false], // xMULTI_WMATIC 
    ["0x4Cd44ced63d9a6FEF595f6AD3F7CED13fCEAc768", false], // tetuQi 
   ]
module.exports = ohmTvlMultiTreasuries(treasuries, treasuryTokens, "polygon", stakingAddress, sphere_token, undefined, undefined, true)

// const treasury = "0x1a2ce410a034424b784d4b228f167a061b94cff4" 
// module.exports = ohmTvl(treasury, treasuryTokens, "polygon", stakingAddress, sphere_token, undefined, undefined, true)
