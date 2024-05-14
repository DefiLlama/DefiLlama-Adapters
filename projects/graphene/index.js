const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  base: {
    fromBlock: 5314581,
    controller: "0xfbF069Dbbf453C1ab23042083CFa980B3a672BbA",
  },
  fantom: {
    fromBlock: 69969086,
    controller: "0xf37102e11E06276ac9D393277BD7b63b3393b361",
  },
  mantle: {
    fromBlock: 18438182,
    controller: "0x7900f766F06e361FDDB4FdeBac5b138c4EEd8d4A",
  },
};

Object.keys(config).forEach((chain) => {
  const { controller, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: controller,
        topic: "PairCreated(uint128,address,address)",
        eventAbi:
          "event PairCreated(uint128 indexed pairId, address indexed token0, address indexed token1)",
        onlyArgs: true,
        fromBlock,
      });
      const tokens = logs.map((i) => [i.token0, i.token1]).flat();

      return sumTokens2({ api, owner: controller, tokens });
    },
  };
});
