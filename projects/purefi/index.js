const { staking, stakings } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

/*** Ethereum Addresses ***/
const UFI = "0xcDa4e840411C00a614aD9205CAEC807c7458a0E3";

const farmingStakingContract = "0xafAb7848AaB0F9EEF9F9e29a83BdBBBdDE02ECe5";

/*** BSC Addresses ***/
const UFI_bsc = "0xe2a59d5e33c6540e18aaa46bf98917ac3158db0d";

const farmingStakingContracts_bsc = [
  //--- Farming ---
  //UFI-1
  "0x33f86fDc03387A066c4395677658747c696932Eb",
  //UFI to earn ULTRA
  "0xAc8892AC86bB02F26544F31af06b86fdD2105862",
  //UFI to earn LTT
  "0x8a92E706cd359536D7A57dC9CC24054f7B17e021",
  //UFI-2
  "0x9ed4B0a2B8345EEb1e43A4D0298e351fc320D278",
  //UFI-3
  "0xafAb7848AaB0F9EEF9F9e29a83BdBBBdDE02ECe5",
  //--- Round ---
  //LTT
  "0x0274c78595B25eBBA4F9e20610422d04d8Dc8086",
  //SAFLE
  "0xfdd4eF64dA10fa5809AaBe98a225A4b94E53d8e1",
  //HAI
  "0x42554c3211e77e65a6c7b6e511be64b4adac6727",
  //UFI to earn IDTT
  "0x0e2F752C845Bdb31368d7012CA93f45AF345Ec73",
  //Distribution
  "0x2905f7d2B05b5Fb22afe4F2B84590f29Bb40D326",
];

/*** Polygon Addresses ***/
const UFI_polygon = "0x3c205C8B3e02421Da82064646788c82f7bd753B9";
const SAFLE_polygon = "0x04b33078Ea1aEf29bf3fB29c6aB7B200C58ea126";
const SCA_polygon = "0x11a819beb0aa3327e39f52f90d65cc9bca499f33";

const farmingStakingContracts_polygon = [
  //--- Farming ---
  //UFI
  "0x532516B671ebD92f2F1775b6d7CCA38165694DFC",
  //UFI and SAFLE
  "0x5A26315f72efB90eC77a879eF781246B663d5482",
  //SCA
  "0x236e7E724c309fEaEBB1d5a36b33a3b8f1617952",
  //SAFLE
  "0xF1a44C75E4D92f4DA737485f96b0c2a1327d91b2",
];

const polygonTvl = async (chainBlocks) => {
  const balances = {};

  let transformAddress = i => `polygon:${i}`;
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [SAFLE_polygon, false],
      [SCA_polygon, false],
    ],
    farmingStakingContracts_polygon,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(farmingStakingContract, UFI),
  },
  bsc: {
    staking: stakings(farmingStakingContracts_bsc, UFI_bsc),
  },
  polygon: {
    staking: stakings(farmingStakingContracts_polygon, UFI_polygon),
    tvl: polygonTvl,
  },
  //tvl: (tvl) => ({}),
  methodology: "Counts tvl of the assets staked on the Farming seccion thgough Farming Contracts",
};
