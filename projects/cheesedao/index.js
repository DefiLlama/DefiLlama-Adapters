const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0xf8c08c5aD8270424Ad914d379e85aC03a44fF996";
module.exports = ohmTvl(treasuryAddress, [
//1DAI
  ["0xef977d2f931c1978db5f6747666fa1eacb0d0339", false],
//1FRAX
  ["0xeb6c08ccb4421b6088e581ce04fcfbed15893ac3", false],
//Sushi LP
  ["0x82723f6c0b32f28ddc2006b9cdbca6cee0ad957a", true]
], "harmony", "0x72Be77E232Dd13E6aE06088696B83256892c2933", "0xBbD83eF0c9D347C85e60F1b5D2c58796dBE1bA0d")