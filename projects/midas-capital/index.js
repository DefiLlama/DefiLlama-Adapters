const sdk = require("@defillama/sdk");

const { compoundExports2 } = require("../helper/compound");

module.exports = {
  hallmarks: [
    ['2023-06-17', 'Protocol was exploited for $600k'],
  ]
}

const pools = {
  bsc: {
    pools: [
      "0x1851e32F34565cb95754310b031C5a2Fc0a8a905", // Helio-Ankr
      "0x31d76A64Bc8BbEffb601fac5884372DEF910F044", // Jarvis
      "0xb2234eE69555EE4C3b6cEA4fd25c4979BbDBf0fd", // Risedle
      "0xEF0B026F93ba744cA3EDf799574538484c2C4f80", // AutoHedge
      "0x5373C052Df65b317e48D6CAD8Bb8AC50995e9459", // BOMB
      "0xCB2841d6d300b9245EB7745Db89A0A50D8468501", // Ankr
      "0x35F3a59389Dc3174A98610727C2e349E275Dc909", // Ellipsis
      "0x3F239A5C45849391E7b839190597B5130780790d", // PancakeStack
      "0x7f8B5fCA1a63C632776ffc9936D2e323c14B57f8", // Alpha Strategies
      "0x20a0ED8c794F96C1479e2867995C99E931Ee36Ba", // Transfero Stables
      "0x5EB884651F50abc72648447dCeabF2db091e4117", // Stader BNBx
      "0xBc06411a6204B36ce6a5559FFBE3a56C5960F6fe", // pStake BNB
      "0x1B6D43501E0c7201Ea061961cBAEc88FB012f57B", // THENA Core Pools

    ],
  },
  moonbeam: {
    pools: [
      "0xeB2D3A9D962d89b4A9a34ce2bF6a2650c938e185", // xDot
      "0x0fAbd597BDecb0EEE1fDFc9B8458Fe1ed0E35028", // BeamSwap
      "0xCc248E6106CB7B05293eF027D5c1c05BF3E39F21", // StellaSwap
    ],
  },
  polygon: {
    pools: [
      "0xD265ff7e5487E9DD556a4BB900ccA6D087Eb3AD2", // Jarvis
      "0xB08A309eFBFFa41f36A06b2D0C9a4629749b17a2", // Arrakis
      "0xBd82D36B9CDfB9747aA12025CeCE3782EDe767FE", // Polygon Liquid Staking
      "0xF1ABd146B4620D2AE67F34EA39532367F73bbbd2", // MIMO
      "0xBd82D36B9CDfB9747aA12025CeCE3782EDe767FE", // Stader MATICx
      "0x59013D8a77D656777329D74ea1C88DA796005F1B" // Planet ix

    ],
  },
  arbitrum: {
    pools: [
      "0x185Fa7d0e7d8A4FE7E09eB9df68B549c660e1116", // Risedle
      "0x44a03C14F30D49cB43b7F7E91E987ecC10cc0b09" // OHM Pool
    ]
  }
};

function getTvl(chain) {
  const config = pools[chain] ?? { pools: [] };
  const tvls = config.pools.map((comptroller) => compoundExports2({ comptroller }));
  let tvl = sdk.util.sumChainTvls(tvls.map((t) => t.tvl))
  let borrowed = sdk.util.sumChainTvls(tvls.map((t) => t.borrowed))
  return { tvl, borrowed }
}

Object.keys(pools).forEach(chain => module.exports[chain] = getTvl(chain))
