const { staking } = require('../helper/staking')
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')
const {transformAvaxAddress} = require('../helper/portedTokens')
const { stakingPricedLP } = require('../helper/staking')


const treasury = "0x6687379035822ee15e2164f9C1280fBEAd0D7627";
const PB_TOKEN = "0x0E75CDb914DdCcA683357dD94d26Caa39BC14B16"
const LP_TOKEN = "0xd3a6eebbe6f6d9197a7fc2aaaf94d8b0ec51f8a8";
const STAKING_ADDRESS = "0xE4738791690AF507C8C7Bf5981ef541568C7C312"
const COREASSETNAME = "magic-internet-money";
const CHAIN = "avax";


async function avaxTvl(time, ethBlock, chainBlocks){
    const balances = {}
    const transform = await transformAvaxAddress()
    await sumTokensAndLPsSharedOwners(balances, [
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
        ["0xd3a6eebbe6f6d9197a7fc2aaaf94d8b0ec51f8a8", true],
        ["0x50b7545627a5162f82a992c33b87adc75187b218", false]
    ], [treasury], chainBlocks.avax, "avax", transform)
    return balances
}

module.exports={
    avax:{
        tvl: avaxTvl,
        staking: stakingPricedLP(STAKING_ADDRESS, PB_TOKEN, CHAIN, LP_TOKEN, COREASSETNAME, true),
    }
}