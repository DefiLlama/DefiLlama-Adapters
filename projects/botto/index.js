const { staking } = require('../helper/staking');
const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const ethereumContracts = [
  "0x19cd3998f106ecc40ee7668c19c47e18b491e8a6",
  "0xf8515cae6915838543bcd7756f39268ce8f853fd",
];

const baseStakingContract = "0x8a7a5991aAf142B43E58253Bd6791e240084F0A9";
const baseToken = "0x24914CB6BD01E6a0CF2a9c0478e33c25926e6a0c";

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ 
      owners: ethereumContracts, 
      token: coreAssets.null 
    }),
    staking: staking(
      ethereumContracts,
      '0x9DFAD1b7102D46b1b197b90095B5c4E9f5845BBA'
    ),
    pool2: staking(
      ethereumContracts, 
      '0x9FF68F61cA5EB0c6606dC517a9d44001e564bb66'
    ),
  },
  base: {
    staking: staking(
      baseStakingContract, 
      baseToken
    ),
  },
};
