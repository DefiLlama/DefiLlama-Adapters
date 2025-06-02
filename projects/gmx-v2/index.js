const { gmxExportsV2 } = require("../helper/gmx");
const { sumTokens2 } = require("../helper/solana");

module.exports = {
  hallmarks: [[1742137957, "Launch on Solana"]],
  arbitrum: {
    tvl: gmxExportsV2({
      eventEmitter: "0xc8ee91a54287db53897056e12d9819156d3822fb",
      fromBlock: 107737756,
    }),
  },
  avax: {
    tvl: gmxExportsV2({
      eventEmitter: "0xDb17B211c34240B014ab6d61d4A31FA0C0e20c26",
      fromBlock: 32162455,
    }),
  },
  solana: {
    tvl: () =>
      sumTokens2({ owner: "CTDLvGGXnoxvqLyTpGzdGLg9pD6JexKxKXSV8tqqo8bN" }),
  },
};
