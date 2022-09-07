// Set Helpers

const { stakings } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniTVL } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");

// Set NULL, Factories

const nullAddress = "0x0000000000000000000000000000000000000000";
const dexFactory = "0x9550b0c83AD5a58898cD4267987Af67e7E52bF55"; // 87, 250
const dexFactoryClassic = "0x9fAEd210e14F95a15b89C0D09D1a55519aC2F26d"; // 61

// Set SNT Addresses

const sntNovaNetwork = "0x657a66332a65b535da6c5d67b8cd1d410c161a08"; // 87 ~> WSNT
const sntFantom = "0x69D17C151EF62421ec338a0c92ca1c1202A427EC"; // 250
const sntClassic = "0x5D33f65Cc32CAB4065074E8fb1c08Df727e7F7cB"; // 61

// Set NUSD Addresses

const nusdNovaNetwork = "0x1F5396f254EE25377A5C1b9c6BfF5f44e9294fFF"; // 87
const nusdFantom = "0xC5cd01e988cD0794E05ab80F2BCdbDF13cE08BD3"; // 250
const nusdClassic = "0xab1E9D7551c1B161cedf96AeaC66b95bc5cCd7d4"; // 61

// Set Staking Protocols

const callStaking = "0xe9749a786c77A89fd45dAd3A6Ad1022eEa897F97"; // 87, 250
const callStakingV2 = "0x1eEAF2AC0fA5D608CC803014DB9A943a80Eaa8eB"; // 87, 250
const callStakingClassic = "0x3C7360A48Ceb3C985D611aA9D0de6d6d9Df96D09"; // 61
const bondStaking = "0xaaBaB0FB0840DFfFc93dbeed364FB46b1ffD92EE"; // 87, 250
const bondStakingClassic = "0x7d9c6eC5Cd1fC08b3a9B168dE6c988649270e1af"; // 61
const liquidStaking = "0x2A3605d98e26Ee6f682084d8E8018f71d867dcB3"; // 87, 250
const liquidStakingClassic = "0x5bD915b4DDfE26D9Ba8Ad795231D7B068ADdc03E"; // 61
const incomeStaking = "0x1bF49Db5Cb35575483dB2E630510fac8d8F177b9"; // 87
const incomeStakingClassic = "0xb6B824D46B3Bd0698E5180bDb010a2C2bf012e1d"; // 61

// Calculate TVL

const dexTVL = {

  // Nova Network
  nova: {
    tvl: getUniTVL({
      factory: dexFactory,
      chain: "nova",
      useDefaultCoreAssets: true,
    }),
  },
  
  // Fantom Opera
  fantom: {
    tvl: getUniTVL({
      factory: dexFactory,
      chain: "fantom",
      useDefaultCoreAssets: true,
    }),
  },
  
  // Ethereum Classic
  ethereumclassic: {
    tvl: getUniTVL({
      factory: dexFactoryClassic,
      chain: "ethereumclassic",
      useDefaultCoreAssets: true,
    }),
  },
  
};

// Exports

const stakingExports = {
  
  // Nova Network
  nova: {
    staking: async (_, _b, { nova: block }) =>
      sumTokens2({
        owners: [callStaking, callStakingV2, bondStaking, liquidStaking, incomeStaking],
        tokens: [nullAddress, sntNovaNetwork, nusdNovaNetwork],
        chain: "nova",
        block,
      }),
  },
  
  // Fantom Opera
  fantom: {
    staking: async (_, _b, { fantom: block }) =>
      sumTokens2({
        owners: [callStaking, callStakingV2, bondStaking, liquidStaking, incomeStaking],
        tokens: [nullAddress, sntFantom, nusdFantom],
        chain: "fantom",
        block,
      }),
  },
  
  // Ethereum Classic
  ethereumclassic: {
    staking: async (_, _b, { ethereumclassic: block }) =>
      sumTokens2({
        owners: [callStakingClassic, bondStakingClassic, liquidStakingClassic, incomeStakingClassic],
        tokens: [nullAddress, sntClassic, nusdClassic],
        chain: "ethereumclassic",
        block,
      }),
  },

};

module.exports = mergeExports([dexTVL, stakingExports]);
