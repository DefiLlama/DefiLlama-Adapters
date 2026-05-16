const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "PRFI/wrapped-native LP staked in PrimeFi staking contracts on each chain.",
  base: {
    tvl: () => ({}),
    pool2: sumTokensExport({ owner: '0x5b6D95545750f1bb1812F5c564d9a401D3DeBd80', tokens: ['0x87B417AF600312df37F551a05ae14bCC3d55bC36'], resolveLP: true }),
  },
  hyperliquid: {
    tvl: () => ({}),
    pool2: sumTokensExport({ owner: '0x33cd734739c6DeD500fD080d476D93135cB813Ef', tokens: ['0x981F145a71Da6DF4A7cBe892807782c9CC9a5515'], resolveLP: true }),
  },
  xdc: {
    tvl: () => ({}),
    pool2: sumTokensExport({ owner: '0x01E7cd81D3d7A4907815877e0C937a77dE537e99', tokens: ['0xffA04F091128fb89D3B1eCd0149DC677dfAe1C69'], resolveLP: true }),
  },
};
