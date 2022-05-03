const sdk = require("@defillama/sdk")
const { ohmTvl } = require('../helper/ohm')

function ohmTvlMultiTreasuries(treasuries, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix = id=>id, tokenOnCoingecko = true) {
    // Accumulate tvl for multiple treasuries, executing simply ohmTvl
    const tvl_per_treasury = treasuries.map(treasury => 
        ohmTvl(treasury, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix, tokenOnCoingecko)
    )
    
    // Edit TVL of object to be the cumulative tvl
    const tvl_object = tvl_per_treasury[0]
    const tvls = tvl_per_treasury.map(o => o[chain === "ftm"?"fantom":chain].tvl)
    tvl_object[chain === "ftm"?"fantom":chain].tvl = sdk.util.sumChainTvls(tvls)
    return tvl_object
}

const sphere_token = "0x89b61Ab033584918103698953870F07D6db412A3"
const treasuries = ["0x914adbe1a641f1e4a8ce22776d342d4c2669f030", "0xaaef45e31e2d2865a4722c1591ba4cd8f6e83bad", "0x0aad04f96b29eb5d31aa52317e19b78a0ffecb8d" ]
const stakingAddress = "0x0000000000000000000000000000000000000000" // NONE
const treasuryTokens = [
    ["0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", false], // WFTM
    ["0x04068da6c83afcfa0e13ba15a6696662335d5b75", false], // USDC
    ["0xf704f5ac5edf152168e07e6f5f108366911250ac", true], // WFTM/KNGFUU, needs to account only half of it
   ]
module.exports = ohmTvlMultiTreasuries(treasuries, treasuryTokens, "fantom", stakingAddress, sphere_token, undefined, undefined, true)