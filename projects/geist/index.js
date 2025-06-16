const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

const stakingContract = "0x49c93a95dbcc9A6A4D8f77E59c038ce5020e82f8";
const GEIST = "0xd8321aa83fb0a4ecd6348d4577431310a6e0814d";

const stakingContractPool2 = "0xE40b7FA6F5F7FB0Dc7d56f433814227AAaE020B5";
const GEIST_WFTM_spLP = "0x668AE94D0870230AC007a01B471D02b2c94DDcB9";

module.exports = {
  deadFrom: '2023-10-18',
  methodology: methodologies.lendingMarket,
  fantom: {
    ...aaveExports("", "0x4CF8E50A5ac16731FA2D8D9591E195A285eCaA82",),
    staking: staking(stakingContract, GEIST),
    pool2: pool2(stakingContractPool2, GEIST_WFTM_spLP),
  },
  hallmarks: [
    [1665090175, "BSC Bridge hacker deposits coins"]
  ],
};

module.exports.fantom.borrowed = () => ({}) // bad debt
