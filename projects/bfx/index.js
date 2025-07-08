const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

//bsc
const bscVault = "0xDDC99EE89f9556749e8e8916eEa5d3bBA8D6F13d";
const bscStaking = "0x0F0b54d7446110210513295336E4A85dDA65e40D";
const bscBFX = "0x491347561CEc563aD7D91135F92dBdC700277505";

module.exports = {
  bsc: {
    staking: staking(bscStaking, bscBFX),
    tvl: gmxExports({ vault: bscVault })
  },
};
