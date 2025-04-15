const abi = require("./abi");

const rankFactoryContracts = ["0x6E9d30690E433503d3dB7001610f60290a286a3f"];

async function tvl(api) {
  for (const rankFactoryContract of rankFactoryContracts) {
    const factorySettings = await api.call({
      abi: abi["factorySettings"],
      target: rankFactoryContract,
      params: [],
    });
    const token = factorySettings.asset;
    const rankStrategiesCount = await api.call({
      abi: abi["rankStrategiesCount"],
      target: rankFactoryContract,
      params: [],
    });
    for (let i = 0; i < rankStrategiesCount; i++) {
      const rankStrategyContract = await api.call({
        abi: abi["rankStrategies"],
        target: rankFactoryContract,
        params: [i],
      });
      const totals = await api.call({
        abi: abi["totals"],
        target: rankStrategyContract,
        params: [],
        permitFailure: true,
      });
      api.add(token, totals.assetAmount);
    }
  }
}

module.exports = {
  methodology: "Sum of all assets locked in Rank Trading contracts",
  start: 47582949,
  bnbt: {
    tvl,
  },
};
