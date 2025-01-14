const { stakingPricedLP } = require('../helper/staking')


const PB_TOKEN = "0x0E75CDb914DdCcA683357dD94d26Caa39BC14B16"
const LP_TOKEN = "0xd3a6eebbe6f6d9197a7fc2aaaf94d8b0ec51f8a8";
const STAKING_ADDRESS = "0xE4738791690AF507C8C7Bf5981ef541568C7C312"
const COREASSETNAME = "magic-internet-money";
const CHAIN = "avax";

module.exports={
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    avax:{
        tvl: () => ({}),
        staking: stakingPricedLP(STAKING_ADDRESS, PB_TOKEN, CHAIN, LP_TOKEN, COREASSETNAME, true),
    }
}
