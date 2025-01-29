const abi = require("./abi");

const rankFactoryContracts = ["0x3dF9430E94DeC9992fDB076254B7B7E8b8932F5b"];

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
