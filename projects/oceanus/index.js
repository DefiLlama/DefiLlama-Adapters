const { pool2 } = require("../helper/pool2");
const {  sumTokensExport } = require("../helper/unwrapLPs");

const OShareRewardPool = "0xc4a5b1CdCcD8CF80aC7cB5B86Fe5a8D64DBA9D0F";
const lpPool2Addresses = [
  "0x08df8bc8c64d121a68b4d384172aa97624cc6bbf",
  "0xc524bef25df04efea73364d487accd241b73ccd2",
];

const stakingContracts = [
  "0x4624cB661b8d5F49c28231D3F819B492c21D495f",
  "0x0aED328D80A8750ED27A19B177025eea1B6D4932",
  OShareRewardPool,
];
const OSHARE = "0x28100159d8b2acc4e45ec7ebdb875265bb752385";
const SEA = "0x41607272ce6f2a42732ae382f00f8f9ce68d78f3";


module.exports = {
  misrepresentedTokens: true,
  metis: {
    tvl: () => ({}),
    staking: sumTokensExport(stakingContracts, [SEA, OSHARE], ),
    pool2: pool2(OShareRewardPool, lpPool2Addresses,),
  },
  methodology: "Counts liquidity on the Pool2s and Staking parts",
};
