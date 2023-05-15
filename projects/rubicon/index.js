const ADDRESSES = require('../helper/coreAssets.json')
const {transformOptimismAddress} = require('../helper/portedTokens')
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')

const tokens = [
    ADDRESSES.optimism.USDC, //USDC
    "0x68f180fcce6836688e9084f035309e29bf0a2095", //WBTC
    ADDRESSES.optimism.DAI, //DAI
    ADDRESSES.optimism.USDT, //USDT
    "0x8700daec35af8ff88c16bdf0418774cb3d7599b4", //SNX
    ADDRESSES.tombchain.FTM, //ETH
    ADDRESSES.optimism.OP  //OP
]

const owners = [
    "0x7a512d3609211e719737E82c7bb7271eC05Da70d", // Rubicon Market

    // * Bath Tokens * TODO: drive dynamically off of subgraph query
    "0xB0bE5d911E3BD4Ee2A8706cF1fAc8d767A550497", // bathETH
    "0x7571CC9895D8E997853B1e0A1521eBd8481aa186", // bathWBTC 
    "0xe0e112e8f33d3f437D1F895cbb1A456836125952", // bathUSDC
    "0x60daEC2Fc9d2e0de0577A5C708BcaDBA1458A833", // bathDAI
    "0xfFBD695bf246c514110f5DAe3Fa88B8c2f42c411", // bathUSDT
    "0xeb5F29AfaaA3f44eca8559c3e8173003060e919f", // bathSNX
    "0x574a21fE5ea9666DbCA804C9d69d8Caf21d5322b"  // bathOP
]

async function tvl(time, ethBlock, {optimism: block}){
    const balances={}
    const transform = await transformOptimismAddress()
    await sumTokensAndLPsSharedOwners(balances, tokens.map(t=>[t, false]), owners, block, "optimism", transform)
    return balances
}

module.exports={
    methodology: "Counts the tokens on the bath pools and on the market (orders in the orderbook)",
    optimism:{
        tvl
    },
    hallmarks:[
        [1657915200, "OP Rewards Start"],
      ]
}