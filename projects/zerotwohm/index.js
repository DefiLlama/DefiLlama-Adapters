const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const stakingContract = "0x06B4dFAbAf0fb0Cf813526572cc86B2695c9D050";
const Z2O = "0xdb96f8efd6865644993505318cc08FF9C42fb9aC";

const treasury = "0x00eFcbd55b59b5D08F3a7501C0Ddad34a57A3611";
const treasuryTokens = [
  [ADDRESSES.arbitrum.WETH, false], // WETH
  ["0x17fc002b466eec40dae837fc4be5c67993ddbd6f", false], // FRAX
  [ADDRESSES.arbitrum.WBTC, false], // WBTC
  [ADDRESSES.arbitrum.MIM, false], // MIM
  ["0x79f12596b78f9e982bdab6e2d83d4bc155672372", false], // chMIM
  ["0x739ca6d71365a08f584c8fc4e1029045fa8abc4b", false], // wsOHM
  ["0x40c938444c725EA6eb6992ca71F94b6945b43335", true], // Z2O-MIM SLP
];

module.exports = {
  misrepresentedTokens: true,
  ...ohmTvl(treasury, treasuryTokens, "arbitrum", stakingContract, Z2O),
  methodology: "Counts as TVL all the assets deposited on the reasury",
};
