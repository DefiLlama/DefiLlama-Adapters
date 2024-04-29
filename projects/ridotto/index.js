const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");
module.exports = {
  bsc: {
    staking: sumTokensExport({
      tokensAndOwners: [
        [
          "0xe9c64384dEb0C2bF06D991A8D708c77eb545E3d5",
          "0x0d514227db4eB4C9ed86a261622BcA326e95a376",
        ], // LOTTERY/RDT
        [
          "0xe9c64384dEb0C2bF06D991A8D708c77eb545E3d5",
          "0xCc6EE7b545EFa1bE02DC08B1e24c2bAe23c2bf9C",
        ], // SLOTS/RDT
        [
          "0xe9c64384dEb0C2bF06D991A8D708c77eb545E3d5",
          "0x2Ae4Ca022882491a7D1229dA25E9E7c6b89AA189",
        ], // MASTER-CROUPIER/RDT
      ],
    }),
    pool2: sumTokensExport({
      tokensAndOwners: [
        [
          "0x3B1Be589E16A1c1f09F554a2339d65cE30125210",
          "0xed60979cA4743aFd86Ad6B204cD5DC2671B4c8d4",
        ], // LOTTERY/LP
        [
          "0x3B1Be589E16A1c1f09F554a2339d65cE30125210",
          "0xf11F35f79CB0FFF47d3467AFF655dCaf67de7570",
        ], // SLOTS/LP
        [
          "0x3B1Be589E16A1c1f09F554a2339d65cE30125210",
          "0x2Ae4Ca022882491a7D1229dA25E9E7c6b89AA189",
        ], // MASTER-CROUPIER/LP
      ],
      resolveLP: true, 
    }),
    tvl: sumTokensExport({
      tokensAndOwners: [
        [
          "0x55d398326f99059fF775485246999027B3197955",
          "0x2c5B04F5744724ccEaAdA451f81b6E6a98D53fde",
        ], // BANKROLL/BUSD
      ],
    }),
  },
};
