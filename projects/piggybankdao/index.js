const ADDRESSES = require('../helper/coreAssets.json')
const {sumTokensAndLPsSharedOwners, sumLPWithOnlyOneToken} = require('../helper/unwrapLPs')
const { stakingPricedLP } = require('../helper/staking')


const treasury = "0x6687379035822ee15e2164f9C1280fBEAd0D7627";
const PB_TOKEN = "0x0E75CDb914DdCcA683357dD94d26Caa39BC14B16"
const LP_TOKEN = "0xd3a6eebbe6f6d9197a7fc2aaaf94d8b0ec51f8a8";
const STAKING_ADDRESS = "0xE4738791690AF507C8C7Bf5981ef541568C7C312"
const COREASSETNAME = "magic-internet-money";
const CHAIN = "avax";
const MIM = "0x130966628846bfd36ff31a822705796e8cb8c18d"


async function avaxTvl(time, ethBlock, chainBlocks){
    const balances = {}
    const transform = addr => 'avax:'+addr
    await sumLPWithOnlyOneToken(balances, "0xd3a6eebbe6f6d9197a7fc2aaaf94d8b0ec51f8a8", treasury, MIM, chainBlocks.avax, "avax", transform)
    await sumTokensAndLPsSharedOwners(balances, [
        [MIM, false],
        [ADDRESSES.avax.WBTC_e, false]
    ], [treasury], chainBlocks.avax, "avax", transform)
    return balances
}

module.exports={
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    avax:{
        tvl: avaxTvl,
        staking: stakingPricedLP(STAKING_ADDRESS, PB_TOKEN, CHAIN, LP_TOKEN, COREASSETNAME, true),
    }
}
