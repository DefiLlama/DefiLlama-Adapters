const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

//ZKera
const zkVault = "0xBC918775C20959332c503d51a9251C2405d9cF88";
const zkStaking = "0xA258D1CfeCaDD96C763dfa50284525f1529cfB35";
const zkZKE = "0x7b3e1236c39ddD2e61cF6Da6ac6D11193238ccB0";

module.exports = {
  era: {
    staking: staking(zkStaking, zkZKE),
    tvl: gmxExports({ vault: zkVault })
  }
}
