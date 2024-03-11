const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, treasuryExports } = require("../helper/treasury");

const COMBO = {
  ethereum: "0xfFffFffF2ba8F66D4e51811C5190992176930278",
  polygon: "0x6DdB31002abC64e1479Fc439692F7eA061e78165",
  arbitrum: "0x94c8f7f04dEA7740fd895a254816F897Df61991e",
};

const treasuries = {
  ethereum: "0x6304EB1B1eC2135a64a90bA901B12Cf769657579",
  polygon: "0x3EBe4dfaF95cd320BF34633B3BDf773FbE732E63",
  arbitrum: "0x3EBe4dfaF95cd320BF34633B3BDf773FbE732E63",
  optimism: "0x168608B226ef4E59Db5E61359509656a51BAe090",
  avax: "0x168608B226ef4E59Db5E61359509656a51BAe090",
  metis: "0x75Ce960F2FD5f06C83EE034992362e593dcf7722",
  fantom: "0x75Ce960F2FD5f06C83EE034992362e593dcf7722",
  base: "0x50Df7c73bA1B4bb74934E50298de73F265260Ea4",
  xdai: "0x4207b828b673EDC01d7f0020E8e8A99D8b454136",
};

module.exports = treasuryExports({
  ethereum: {
    owners: [treasuries.ethereum],
    ownTokens: [COMBO.ethereum],
  },
  polygon: {
    owners: [treasuries.polygon],
    ownTokens: [COMBO.polygon],
    blacklistedTokens: [
      "0x7A5011BF1dAd77a23EC35CE04dCc2AC7d29963c5", // PECO-WMATIC-SLP
    ],
  },
  arbitrum: {
    owners: [treasuries.arbitrum],
    ownTokens: [COMBO.arbitrum],
  },
  optimism: {
    owners: [treasuries.optimism],
  },
  avax: {
    owners: [treasuries.optimism],
  },
  metis: {
    owners: [treasuries.metis],
  },
  fantom: {
    owners: [treasuries.fantom],
  },
  base: {
    owners: [treasuries.base],
  },
  xdai: {
    owners: [treasuries.xdai],
  },
});
