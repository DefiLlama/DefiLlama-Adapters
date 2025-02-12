const { staking } = require('../helper/staking');

const CONTRACT_ADDRESS = "0xbe2cf8DA9887e2AB997Ed53cC49263eBD09B20C3";
const TOKENS = [
  "0x32B053F2CBA79F80ada5078cb6b305da92BDe6e1", // neural
  "0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44"  // wtao
];

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(CONTRACT_ADDRESS, TOKENS),
  },
};
