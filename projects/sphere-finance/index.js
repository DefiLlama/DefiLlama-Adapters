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

const sphere_token = "0x62F594339830b90AE4C084aE7D223fFAFd9658A7"
const treasuries = ["0x1a2ce410a034424b784d4b228f167a061b94cff4", "0x826b8d2d523e7af40888754e3de64348c00b99f4", "0x20d61737f972eecb0af5f0a85ab358cd083dd56a" ]
const stakingAddress = "0x0000000000000000000000000000000000000000" // NONE
const treasuryTokens = [
    // ["0x8D546026012bF75073d8A586f24A5d5ff75b9716", false], // SPHERE, remove as it is the collateralized token
    ["0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", false], // WMATIC
    ["0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", false], // miMATIC
    ["0x236eeC6359fb44CCe8f97E99387aa7F8cd5cdE1f", false], //USD+
    ["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", false], // USDC
    ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", false], // USDT
    ["0x39aB6574c289c3Ae4d88500eEc792AB5B947A5Eb", false], //DYST
    ["0x9008D70A5282a936552593f410AbcBcE2F891A97", false], //PEN
    ["0xb8E91631F348dD1F47Cb46f162df458a556c6f1e", true],  // USD+/SPHERE, needs to account only half of it
    
    ["0xb880e6AdE8709969B9FD2501820e052581aC29Cf", false], // iWMATIC
    ["0xbE068B517e869f59778B3a8303DF2B8c13E05d06", false], //iDAI
    ["0xeE3B4Ce32A6229ae15903CDa0A5Da92E739685f7", false], // xIRON_LOAN_USDC
    ["0xeF7B706cA139dBd9010031a50de5509D890CE527", false], // xMULTI_WMATIC 
    ["0x4Cd44ced63d9a6FEF595f6AD3F7CED13fCEAc768", false], // tetuQi 
   ]
module.exports = ohmTvlMultiTreasuries(treasuries, treasuryTokens, "polygon", stakingAddress, sphere_token, undefined, undefined, true)

// const treasury = "0x1a2ce410a034424b784d4b228f167a061b94cff4" 
// module.exports = ohmTvl(treasury, treasuryTokens, "polygon", stakingAddress, sphere_token, undefined, undefined, true)
