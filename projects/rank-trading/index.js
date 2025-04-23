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
    const rankStrategyContracts = await api.multiCall({
      abi: abi["rankStrategies"],
      target: rankFactoryContract,
      calls: Array.from({ length: rankStrategiesCount }, (_, i) => (
        { params: [i] }
      )),
    });

    const totals = await api.multiCall({
      abi: abi["totals"],
      calls: rankStrategyContracts,
      permitFailure: true,
    });

    totals.forEach((total) => {
      if (total) {
        api.add(token, total.assetAmount);
      }
    });
  }
}

module.exports = {
  methodology: "Sum of all assets locked in Rank Trading contracts",
  start: 48201631,
  bsc: {
    tvl,
  },
};
