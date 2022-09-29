const { compoundExportsWithAsyncTransform } = require("../helper/compound");
const sdk = require("@defillama/sdk");

function getTvl(chain) {
  const pools = {
    bsc: {
      pools: [
        "0x31d76A64Bc8BbEffb601fac5884372DEF910F044", // Jarvis
        "0xb2234eE69555EE4C3b6cEA4fd25c4979BbDBf0fd", // Risedile
        "0xEF0B026F93ba744cA3EDf799574538484c2C4f80", // AutoHedge
        "0x5373C052Df65b317e48D6CAD8Bb8AC50995e9459", // BOMB
        "0xfeB4f9080Ad40ce33Fd47Ff6Da6e4822fE26C7d5", // Ankr
        "0xd3E5AAFebBF06A071509cf894f665710dDaa800d", // Tester
      ],
    },
    moonbeam: {
      pools: [
        "0xeB2D3A9D962d89b4A9a34ce2bF6a2650c938e185", // xDot
        "0x0fAbd597BDecb0EEE1fDFc9B8458Fe1ed0E35028", // BeamSwap
      ],
    }
  };
  const config = pools[chain] ?? { pools: [] };
  const tvls = config.pools.map((pool) =>
    compoundExportsWithAsyncTransform(
      pool,
      chain,
      undefined,
      undefined
    )
  );
  return {
    tvl: sdk.util.sumChainTvls(tvls.map((t) => t.tvl)),
    borrowed: sdk.util.sumChainTvls(tvls.map((t) => t.borrowed)),
  };
}

module.exports = {
  bsc: getTvl("bsc"),
  moonbeam: getTvl("moonbeam"),
};
