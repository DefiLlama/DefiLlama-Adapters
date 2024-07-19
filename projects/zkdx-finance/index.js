const { gmxExports } = require("../helper/gmx");
const { staking } = require("../helper/staking");

const zkStaking = "0xA258D1CfeCaDD96C763dfa50284525f1529cfB35";
const zkZKE = "0x7b3e1236c39ddD2e61cF6Da6ac6D11193238ccB0";

module.exports = {
  era: {
    tvl: gmxExports({ vault: '0xBC918775C20959332c503d51a9251C2405d9cF88' }),
    staking: staking(zkStaking, zkZKE), 
  },
  metis: {
    tvl: gmxExports({ vault: '0x79C365bA484CBa73F3e9cB04186ddCc0DEBFB00c' }),
    //staking: staking("0xb3Bcb2839b7fb103b1a117dBb451829078acAD59", "0xdf020cBd1897133978C7FcDF04B07E69d8934Efc"), 
  },
  telos: {
    tvl: gmxExports({ vault: '0x17D3FdF3b017C96782dE322A286c03106C75C62E' }),
    //staking: staking(zkStaking, "0xdf020cBd1897133978C7FcDF04B07E69d8934Efc"), 
  },
};