const abi = require("./abi");

const rankFactoryContracts = [
  "0x6E9d30690E433503d3dB7001610f60290a286a3f",
  "0x7cD6ead7e0834Ae8bc393bA4c933Bb9e80e7dC19"
];

async function tvl(api) {
  const factorySettings = await api.multiCall({
    abi: abi["factorySettings"],
    calls: rankFactoryContracts,
    permitFailure: true,
  });
  const tokens = factorySettings.map((f) => f.asset);
  const rankStrategiesCounts = await api.multiCall({
    abi: abi["rankStrategiesCount"],
    calls: rankFactoryContracts,
    permitFailure: true,
  });

  for (let i = 0; i < rankFactoryContracts.length; i++) {
    const rankFactoryContract = rankFactoryContracts[i];
    const token = tokens[i];
    const rankStrategiesCount = rankStrategiesCounts[i];

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
