// Maverick Protocol
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

function maverickTVL(config) {
  const exports = {};

  Object.keys(config).forEach((chain) => {
    const { factories } = config[chain];
    exports[chain] = {
      tvl: async (_, _b, _cb, { api }) => {
        let logs = [];
        for (let k = 0; k < factories.length; k++) {
          logs.push(
            ...(await getLogs({
              api,
              target: factories[k].address,
              topics: [
                "0x848331e408557f4b7eb6561ca1c18a3ac43004fbe64b8b5bce613855cfdf22d2",
              ],
              fromBlock: factories[k].startBlock,
              eventAbi:
                "event PoolCreated(address poolAddress,uint8 protocolFeeRatio,uint256 feeAIn,uint256 feeBIn,uint256 tickSpacing,uint256 lookback,int32 activeTick,address tokenA,address tokenB,uint8 kinds,address accessor)",
              onlyArgs: true,
            }))
          );
        }

        return sumTokens2({
          api,
          ownerTokens: logs.map((i) => [[i.tokenA, i.tokenB], i.poolAddress]),
        });
      },
    };
  });

  return exports;
}

module.exports = maverickTVL({
  ethereum: {
    factories: [
      {
        address: "0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e",
        startBlock: 20027236,
      },
    ],
  },
  era: {
    factories: [
      {
        address: "0x7A6902af768a06bdfAb4F076552036bf68D1dc56",
        startBlock: 35938167,
      },
    ],
  },
  bsc: {
    factories: [
      {
        address: "0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e",
        startBlock: 39421941,
      },
    ],
  },
  base: {
    factories: [
      {
        address: "0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e",
        startBlock: 15321281,
      },
    ],
  },
  arbitrum: {
    factories: [
      {
        address: "0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e",
        startBlock: 219205177,
      },
    ],
  },
});
