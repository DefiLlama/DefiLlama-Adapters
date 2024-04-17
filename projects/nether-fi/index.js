const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

const vaultBase = "0xAd378C374f7996235E927e693eDea32605C0A61F";
const stakingBase = "0x6ffC50886775D4A26AF1B0f88F9df61267e69aec";
const NFI = "0x60359A0DD148B18d5cF1Ddf8Aa1916221ED0cbCd";

module.exports = {
  base: {
    staking: staking(stakingBase, NFI),
    tvl: gmxExports({ vault: vaultBase }),
  }
};
