const sdk = require('@defillama/sdk')
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')
const {staking} = require('../helper/staking')
const {pool2s} = require('../helper/pool2')

const kala = '0x32299c93960bb583a43c2220dc89152391a610c5'
const masterchef = '0x565bCba3eA730ac6987edE126B29DCf499fccEA1'
const pool2Lps = ["0x64330C8AcCd74E8EB30894F341eF45c743B875b5", "0x2401F882CA9952df2aF3e335D4606620Be19aE89"]

const trans = addr=>{
    if(addr.toLowerCase() === "0x598308047116a8055c1e3debd2b761e3bc3dbcb8"){ // kUSD
        return "0x0000000000085d4780b73119b644ae5ecd22b376" //tusd
    }
    return 'bsc:'+addr
}

async function tvl(time, ethBlock, chainBlocks){
    const chain = 'bsc'
    const block = chainBlocks.bsc
    const balances = {}
    // minting
    await sumTokensAndLPsSharedOwners(balances,[
        ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false], //BUSD
        [kala, false],
        ["0x598308047116a8055c1e3debd2b761e3bc3dbcb8", false], //kUSD
    ], ["0x2d067575BE1f719f0b0865D357e67925B6f461C5"], block, chain, trans)
    return balances
}

async function masterchefTvl(time, ethBlock, chainBlocks){
    const chain = 'bsc'
    const block = chainBlocks.bsc
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances,[
        ["0x598308047116a8055c1e3debd2b761e3bc3dbcb8", false], //kUSD
        ["0x6b2ADA69629592C04374FA27A17Fd538042BB299", true],
        ["0x9a1C5D24492b6A3B99472270E58E95EF705eAe39", true],
        ["0x6882911440c04Df3cBf2f82b6921097f53D7B767", true],
        ["0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", false],
        ["0x2170Ed0880ac9A755fd29B2688956BD959F933F8", false],
        ["0x23396cf899ca06c4472205fc903bdb4de249d6fc", false],
        ["0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", false],
        ["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", false],
        ["0x55d398326f99059ff775485246999027b3197955", false],
        ["0x85593d5786b89a5659dbe3784e7c296827d70389", true],
        ["0x2f5b3ab702b48b448d510200676af63630c6daa2", true],
        ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
        ["0x5066c68cae3b9bdacd6a1a37c90f2d1723559d18", false]
    ], [masterchef], block, chain, trans)
    return balances
}

module.exports={
    methodology: 'kUSD replaced by TUSD',
    bsc:{
        tvl: sdk.util.sumChainTvls([tvl, masterchefTvl]),
        masterchef: masterchefTvl,
        staking: staking(masterchef, kala, 'bsc'),
        pool2: pool2s([masterchef], pool2Lps, 'bsc', trans)
    }
}