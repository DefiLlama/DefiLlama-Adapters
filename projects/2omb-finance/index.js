const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const shares = "0xc54a1684fd1bef1f077a336e6be4bd9a3096a6ca";
const masonry = "0x627A83B6f8743c89d58F17F994D3F7f69c32F461";
const rewardPool = "0x8D426Eb8C7E19b8F13817b07C0AB55d30d209A96";
const ThreeOmbGenesisPoolsContract = "0xcB0b0419E6a1F46Be89C1c1eeeAf9172b7125b29";
const pool2LPs = [
  "0xbdC7DFb7B88183e87f003ca6B5a2F81202343478", // 2OMB-FTM spLP
  "0x6398ACBBAB2561553a9e458Ab67dCFbD58944e52", // 2SHARE-WFTM spLP
];

module.exports = {
  fantom: {
    tvl: () => ({}),
    staking: staking(masonry, shares),
    pool2: pool2([rewardPool, ThreeOmbGenesisPoolsContract], pool2LPs),
  },
};
