const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const shareMasterChefContract = "0xC9aE03864271a8f18bEC0afD3c2dccF3D0700950";
const ONS = "0x5bb29c33c4a3c29f56f8aca40b4db91d8a5fe2c5";
const ONC = "0xd90e69f67203ebe02c917b5128629e77b4cd92dc";

const DAIONSLPTokenSharePool = "0x11dAb122FA5ab4D407521Ae1CA416dEFF198b688";
const ONS_DAI_UNIV2 = "0x896dc58182C3B78598C11aa10F940257A1cE32b1";

const DAIONCLPTokenSharePool = "0x78A05fDA97C8458F07e03583fdaf05Ff6ee4f6C9";
const ONC_DAI_UNIV2 = "0x3Ba3C8fB0142A6f2bf3e2990A08957866203f961";

const boardroomContracts = [
  "0x6aCb13480D431C99e68794F038e00857DA8D1fF3",
  "0x8eeBDFc76a9f98d0b36b107A940ADAdBA8C8df27",
  "0xFD35C0e9706A669d7be9B2D9C69AE2927F1071dB",
  "0xd22C1549017Cf96eAA093ad47Da0CF62f42b0562",
];

const stakingContracts = boardroomContracts.concat([shareMasterChefContract])

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, ONS),
    pool2: pool2s(
      [shareMasterChefContract, DAIONSLPTokenSharePool, DAIONCLPTokenSharePool],
      [ONC_DAI_UNIV2, ONS_DAI_UNIV2]
    ),
    tvl: (tvl) => ({}),
  },
  methodology:
    "Counts liquidty on the Staking and Pool2 Only",
};
