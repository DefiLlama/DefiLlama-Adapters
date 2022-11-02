const sdk = require("@defillama/sdk")
const { ohmTvl } = require('../helper/ohm')

function ohmTvlMultiTreasuries(treasuries, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix = id=>id, tokenOnCoingecko = true) {
    // Accumulate tvl for multiple treasuries, executing simply ohmTvl
    const tvl_per_treasury = treasuries.map(treasury =>
        ohmTvl(treasury, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix, tokenOnCoingecko)
    )

    // Edit TVL of object to be the cumulative tvl
    const tvl_object = tvl_per_treasury[0]
    const tvls = tvl_per_treasury.map(o => o[chain].tvl)
    tvl_object[chain].tvl = sdk.util.sumChainTvls(tvls)
    return tvl_object
}

const sphere_token = "0x62f594339830b90ae4c084ae7d223ffafd9658a7"
const treasuries = ["0x1a2ce410a034424b784d4b228f167a061b94cff4", "0x826b8d2d523e7af40888754e3de64348c00b99f4", "0x20d61737f972eecb0af5f0a85ab358cd083dd56a" ]
const stakingAddress = "0x62F594339830b90AE4C084aE7D223fFAFd9658A7" // Sphere Games StakePrizePool
const treasuryTokens = [
    // ["0x8D546026012bF75073d8A586f24A5d5ff75b9716", false], // SPHERE, remove as it is the collateralized token
    ["0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", false], // WMATIC
    ["0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", false], // miMATIC
    ["0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4", false], // stMatic
    ["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", false], // USDC
    ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", false], // USDT
    ["0xEBb865Bf286e6eA8aBf5ac97e1b56A76530F3fBe", false], // 0VIX oUSD
    ["0x236eeC6359fb44CCe8f97E99387aa7F8cd5cdE1f", false], // USD+
    ["0xb8E91631F348dD1F47Cb46f162df458a556c6f1e", true], // USD+/SPHERE, needs to account only half of it
    ["0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3", false], // BAL
    ["0x1d734A02eF1e1f5886e66b0673b71Af5B53ffA94", false], // STADER
    ["0xC3C7d422809852031b44ab29EEC9F1EfF2A58756", false], // LDO
    ["0xC3C7d422809852031b44ab29EEC9F1EfF2A58756", false], // DYST
    ["0x9008D70A5282a936552593f410AbcBcE2F891A97", false], // PEN

    ["0xdFFe97094394680362Ec9706a759eB9366d804C2", false], // Balancer B-MaticX-Stable RewardGauge
    ["0x1c514fEc643AdD86aeF0ef14F4add28cC3425306", false], // Balancer bb-am-usd RewardGauge
    ["0xeE3B4Ce32A6229ae15903CDa0A5Da92E739685f7", false], // xIRON_LOAN_USDC
    ["0xeF7B706cA139dBd9010031a50de5509D890CE527", false], // xMULTI_WMATIC
    ["0x4Cd44ced63d9a6FEF595f6AD3F7CED13fCEAc768", false], // tetuQi
    ["0x5b0522391d0A5a37FD117fE4C43e8876FB4e91E6", false], // penDYST
   ]
module.exports = ohmTvlMultiTreasuries(treasuries, treasuryTokens, "polygon", stakingAddress, sphere_token, undefined, undefined, true)

// const treasury = "0x1a2ce410a034424b784d4b228f167a061b94cff4"
// module.exports = ohmTvl(treasury, treasuryTokens, "polygon", stakingAddress, sphere_token, undefined, undefined, true)
