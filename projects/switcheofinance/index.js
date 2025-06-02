const { sumTokensExport } = require("../helper/unwrapLPs");

const tokens = require("../helper/coreAssets.json");

const ethereumContract = [
  "0x7ee7Ca6E75dE79e618e88bDf80d0B1DB136b22D0",
];

const ethereumTokens = [
  tokens.null,
  "0x2AF5D2aD76741191D15Dfe7bF6aC92d4Bd912Ca3",
  "0x27702a26126e0B3702af63Ee09aC4d1A084EF628",
  "0x4a220E6096B25EADb88358cb44068A3248254675",
  "0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d",
  "0xC0F9bD5Fa5698B6505F643900FFA515Ea5dF54A9",
  "0x940a2dB1B7008B6C776d4faaCa729d6d4A4AA551",
  "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
  "0xba100000625a3754423978a60c9317c58a424e3D",
  tokens.ethereum.DAI,
  tokens.ethereum.USDT,
  tokens.ethereum.WBTC,
  tokens.ethereum.LINK,
  tokens.ethereum.MKR,
  tokens.ethereum.SNX,
  tokens.ethereum.YFI,
  tokens.ethereum.USDC,
  tokens.ethereum.SAI,
  tokens.ethereum.AAVE,
];

module.exports = {
  ethereum: { tvl: sumTokensExport({ owners: ethereumContract, tokens: ethereumTokens }) }
};
