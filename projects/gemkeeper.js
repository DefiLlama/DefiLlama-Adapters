const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');
const { staking, stakingPricedLP } = require("./helper/staking.js");
const xBlingContract = "0x25070fA2244b41EA39B964DBFA9E0ab70A886e72"
const BlingAddr = "0x72Ad551af3c884d02e864B182aD9A34EE414C36C"
const wRoseBlingLP = "0xb29553faf847ba5b79b6ae13fa82d0b216faf626"
module.exports = {
    oasis: {
        tvl: calculateUsdUniTvl(
            '0xa7200334f652425A12BF2f7e4F0F5409CCA4d963',
            'oasis',
            '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
            [
                '0xdC19A122e268128B5eE20366299fc7b5b199C8e3',
            ],
            'oasis-network'
        ),
        staking: stakingPricedLP(xBlingContract,BlingAddr,"oasis",wRoseBlingLP,"oasis-network")
    }
};