const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const ethereumPairsTvl = getUniTVL({
  chain: "ethereum",
  factory: "0x7753F36E711B66a0350a753aba9F5651BAE76A1D",
  fetchBalances: true,
});
const polygonPairsTvl = getUniTVL({
  factory: "0x9A1e1681f6D59Ca051776410465AfAda6384398f",
  chain: "polygon",
  fetchBalances: true,
});
const bscPairsTvl = getUniTVL({
  factory: "0xA8EF6FEa013034E62E2C4A9Ec1CDb059fE23Af33",
  chain: "bsc",
  fetchBalances: true,
});
const arbitrumPairsTvl = getUniTVL({
  factory: "0x41A00e3FbE7F479A99bA6822704d9c5dEB611F22",
  chain: "arbitrum",
  fetchBalances: true,
});

module.exports = {
  ethereum: {
    tvl: ethereumPairsTvl,
    staking: stakings(
      [
        "0xB940D63c2deD1184BbdE059AcC7fEE93654F02bf",
        "0x80497049b005Fd236591c3CD431DBD6E06eB1A31",
      ],
      "0x5de8ab7e27f6e7a1fff3e5b337584aa43961beef"
    ),
  },
  polygon: {
    tvl: polygonPairsTvl,
  },
  arbitrum: {
    tvl: arbitrumPairsTvl,
  },
  bsc: {
    tvl: bscPairsTvl,
  },
};
