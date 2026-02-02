const { getUniTVL } = require('./helper/unknownTokens')
const { staking, stakingPriceLP } = require("./helper/staking.js");
const xBlingContract = "0x25070fA2244b41EA39B964DBFA9E0ab70A886e72"
const BlingAddr = "0x72Ad551af3c884d02e864B182aD9A34EE414C36C"
const wRoseBlingLP = "0xb29553faf847ba5b79b6ae13fa82d0b216faf626"
module.exports = {
    oasis: {
        tvl: getUniTVL({ factory: '0xa7200334f652425A12BF2f7e4F0F5409CCA4d963', useDefaultCoreAssets: true }),
        staking: stakingPriceLP(xBlingContract, BlingAddr, wRoseBlingLP)
    }
};