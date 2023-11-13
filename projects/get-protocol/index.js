const { staking } = require("../helper/staking");

const stakingContractEthereum = "0x3e49e9c890cd5b015a18ed76e7a4093f569f1a04";
const getTokenAddressEthereum = "0x8a854288a5976036a725879164ca3e91d30c6a1b";
const stakingContractPolygon = "0x3e49e9c890cd5b015a18ed76e7a4093f569f1a04";
const getTokenAddressPolygon = "0xdb725f82818De83e99F1dAc22A9b5B51d3d04DD4";

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(stakingContractEthereum, getTokenAddressEthereum),
  },
  polygon: {
    tvl: () => ({}),
    staking: staking(stakingContractPolygon, getTokenAddressPolygon),
  },
};
