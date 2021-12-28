const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0xA2B48Ad28c09cc64CcCf9eD73e1EfceD052877d5";
module.exports = ohmTvl(treasuryAddress, [
//BSC-USD
  ["0x55d398326f99059ff775485246999027b3197955", false],
//BUSD
  ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
//BABY LP
  ["0xd397a40884ce00e662b419673e0b15cae628877f", true] ,
//Pancake LP
  ["0x41516dca7efe69518ec414de35e5aa067788de3d", true]
], "bsc", "0xb82aC36e9dF3c700F12ECF552F240BF4D7B7a212", "0x141381f07Fa31432243113Cda2F617d5d255d39a" , undefined, undefined, false)