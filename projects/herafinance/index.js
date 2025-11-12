const { stakings } = require("../helper/staking");

const stakingContracts = [
  // stakingContract1 =
  "0x2508965Ec75498c451B9e325B7A09288f27762D8",
  // stakingContract2
  "0x2ec37306801cb2dce6526C71b28916a70a835C03",
  // stakingContract3 - omnichain staking - LayerZero
  "0x9abB8642ab4B184F2a56340C2766cdc0f357500E",
];

const HERA_TOKEN = "0x6F05709bc91Bad933346F9E159f0D3FdBc2c9DCE";

module.exports = {
  metis: {
    staking: stakings(stakingContracts, HERA_TOKEN),
    tvl: () => ({}),
  },
};
