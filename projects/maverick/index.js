// Maverick Protocol
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

function maverickTVL(config) {
  const exports = {};

  Object.keys(config).forEach((chain) => {
    const { factories } = config[chain];
    exports[chain] = {
      tvl: async (api) => {
        let logs = [];
        for (let k = 0; k < factories.length; k++) {
          logs.push(
            ...(await getLogs({
              api,
              target: factories[k].address,
              topics: [
                "0x9b3fb3a17b4e94eb4d1217257372dcc712218fcd4bc1c28482bd8a6804a7c775",
              ],
              fromBlock: factories[k].startBlock,
              eventAbi:
                "event PoolCreated(address poolAddress, uint256 fee, uint256 tickSpacing, int32 activeTick, int256 lookback, uint64 protocolFeeRatio, address tokenA, address tokenB)",
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
        address: "0xEb6625D65a0553c9dBc64449e56abFe519bd9c9B",
        startBlock: 17210221,
      },
      {
        address: "0xa5eBD82503c72299073657957F41b9cEA6c0A43A",
        startBlock: 16727800,
      },
    ],
  },
  era: {
    factories: [
      {
        address: "0x96707414DB71e553F6a49c7aDc376e40F3BEfC33",
        startBlock: 1337265,
      },
      {
        address: "0x2C1a605f843A2E18b7d7772f0Ce23c236acCF7f5",
        startBlock: 3002731,
      },
    ],
  },
  bsc: {
    factories: [
      {
        address: "0x76311728FF86054Ad4Ac52D2E9Ca005BC702f589",
        startBlock: 29241050,
      },
    ],
  },
  base: {
    factories: [
      {
        address: "0xB2855783a346735e4AAe0c1eb894DEf861Fa9b45",
        startBlock: 1489614,
      },
    ],
  },
});
