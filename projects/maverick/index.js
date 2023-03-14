// Maverick Protocol
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

function maverickTVL(config) {
  const exports = {};

  Object.keys(config).forEach((chain) => {
    const { factory, fromBlock } = config[chain];
    exports[chain] = {
      tvl: async (_, _b, _cb, { api }) => {
        const logs = await getLogs({
          api,
          target: factory,
          topics: [
            "0x9b3fb3a17b4e94eb4d1217257372dcc712218fcd4bc1c28482bd8a6804a7c775",
          ],
          fromBlock,
          eventAbi:
            "event PoolCreated(address poolAddress, uint256 fee, uint256 tickSpacing, int32 activeTick, int256 lookback, uint64 protocolFeeRatio, address tokenA, address tokenB)",
          onlyArgs: true,
        });

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
    factory: "0xa5eBD82503c72299073657957F41b9cEA6c0A43A",
    fromBlock: 16727800,
  },
});
