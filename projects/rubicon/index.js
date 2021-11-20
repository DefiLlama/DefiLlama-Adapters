const { getBlock } = require('../helper/getBlock')
const {transformOptimismAddress} = require('../helper/portedTokens')
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')

const tokens = [
    "0x7f5c764cbc14f9669b88837ca1490cca17c31607", //USDC
    "0x68f180fcce6836688e9084f035309e29bf0a2095", //WBTC
    "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", //DAI
    "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", //USDT
    "0x8700daec35af8ff88c16bdf0418774cb3d7599b4", //SNX
    "0x4200000000000000000000000000000000000006", //ETH
]

const owners = [
    "0x7a512d3609211e719737E82c7bb7271eC05Da70d", // Rubicon Market
    // Bath tokens
    "0xB0bE5d911E3BD4Ee2A8706cF1fAc8d767A550497",
    "0x7571CC9895D8E997853B1e0A1521eBd8481aa186",
    "0xe0e112e8f33d3f437D1F895cbb1A456836125952",
    "0x60daEC2Fc9d2e0de0577A5C708BcaDBA1458A833",
    "0xfFBD695bf246c514110f5DAe3Fa88B8c2f42c411"
]

async function tvl(time, ethBlock, chainBlocks){
    const block = await getBlock(time, "optimism", chainBlocks, true)
    const balances={}
    const transform = await transformOptimismAddress()
    await sumTokensAndLPsSharedOwners(balances, tokens.map(t=>[t, false]), owners, block, "optimism", transform)
    return balances
}

module.exports={
    methodology: "Counts the tokens on the bath pools and on the market (orders in the orderbook)",
    optimism:{
        tvl
    }
}