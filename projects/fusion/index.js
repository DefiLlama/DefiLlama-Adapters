const ADDRESSES = require('../helper/coreAssets.json')
// Set Helpers

const { stakings } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniTVL, sumUnknownTokens } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");

// Set NULL, Factories

const nullAddress = ADDRESSES.null;
const dexFactory = "0x9550b0c83AD5a58898cD4267987Af67e7E52bF55"; // 87, 250
const dexFactoryClassic = "0x9fAEd210e14F95a15b89C0D09D1a55519aC2F26d"; // 61

// Set SNT Addresses

const sntNovaNetwork = "0x657a66332a65b535da6c5d67b8cd1d410c161a08"; // 87 ~> WSNT
const sntFantom = "0x69D17C151EF62421ec338a0c92ca1c1202A427EC"; // 250
const sntClassic = "0x5D33f65Cc32CAB4065074E8fb1c08Df727e7F7cB"; // 61

// Set NUSD Addresses

const nusdNovaNetwork = ADDRESSES.nova.NUSD; // 87
const nusdFantom = ADDRESSES.fantom.nUSD; // 250
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

// Set Farm Addresses

const yieldFarms = "0x00501ed66d67b1127809e54395f064e256b75b23"; // 87, 250
const yieldFarmsClassic = "0x9599ceBf169A1F3503996CBf90deA38C515ddd54"; // 61

// Calculate TVL

const dexTVL = {

  // Nova Network
  // nova: {
  //   tvl: getUniTVL({
  //     factory: dexFactory,
  //     useDefaultCoreAssets: true,
  //   }),
  // },
  nova: {
    tvl: () => ({}),
  },
  
  // Fantom Opera
  fantom: {
    tvl: getUniTVL({
      factory: dexFactory,
      useDefaultCoreAssets: true,
    }),
  },
  
  // Ethereum Classic
  ethereumclassic: {
    tvl: getUniTVL({
      factory: dexFactoryClassic,
      useDefaultCoreAssets: true,
    }),
  },
  
};

// Exports

const stakingExports = {
  
  // Nova Network
  // nova: {
  //   staking: async (_, _b, { nova: block }) =>
  //     sumTokens2({
  //       owners: [callStaking, callStakingV2, bondStaking, liquidStaking, incomeStaking],
  //       tokens: [nullAddress, sntNovaNetwork, nusdNovaNetwork],
  //       lps: [yieldFarms],
  //       chain: "nova",
  //       block,
  //     }),
  // },

  nova: {
    staking: () => ({}),
  },
  
  // Fantom Opera
  fantom: {
    staking: async (_, _b, { fantom: block }) =>
      sumTokens2({
        owners: [callStaking, callStakingV2, bondStaking, liquidStaking, incomeStaking],
        tokens: [nullAddress, sntFantom, nusdFantom],
        lps: [yieldFarms],
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
        lps: [yieldFarmsClassic],
        chain: "ethereumclassic",
        block,
      }),
  },
  
  methodology: `Fusion calculates all LPs across the different compatible chains to determine the TVL, and uses CoinGecko to determine the USD
                denomination. Staking is calculated separately using all staking contracts across the different networks, and CoinGecko to determine
                the USD denomination of the TVL. Visit https://fusion.novanetwork.io/ for more information or https://info.fusion.novanetwork.io/ for
                in-depth analytics (available exclusively on Nova Network).`,

};

module.exports = mergeExports([dexTVL, stakingExports]);
