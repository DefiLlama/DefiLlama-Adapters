const {ohmTvl} = require("../helper/ohm");

const bsc33 = "0x25559a80e1f6e0d6db28848003716a555727ca55";
const stakingContract = "0x56c3748c89018e8f95b9905c38df0fdda8c06c31";
const treasury = "0x0D5103c0B7228faEa82d2F0F2960f076CE0b2981";

module.exports = {
    ...ohmTvl(treasury, [
        ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false], // WBNB
        ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false], // BUSD
        ["0xa279b7482a021db781b75f2da872d791dfa93c40", true] // BSC33-BUSD CAKELP
    ], "bsc", stakingContract, bsc33)
}