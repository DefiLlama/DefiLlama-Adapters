const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryContracts = [
  "0xd93DC6B8Ef043C3ad409C6480A57b4851b3C055e",
  "0xF30Ccf37c7058Db0026DE9239d373a1c8723210a"
];
const treasuryContractsBSC = [
  "0x3226dBce6317dF643EB68bbeF379E6B968b3E669",
  "0xb9C76Db167Fa6BFd0e6d78063C63B3073C637497",
  "0x6F712F28834b82B7781311b42a945a6134112B2A"
];

module.exports = treasuryExports({
  ethereum: {
    tokens: [ nullAddress, ],
    owners: treasuryContracts,
    ownTokens: ['0x7cA4408137eb639570F8E647d9bD7B7E8717514A'],
  },
  bsc: {
    tokens: [ nullAddress, ],
    owners: treasuryContractsBSC,
    ownTokens: ['0xc5e6689c9c8b02be7c49912ef19e79cf24977f03'],
  },
})
