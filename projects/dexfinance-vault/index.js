const { abi } = require("./abi");

const CONFIG = {
  optimism: {
    factory: "0xd4f1a99212e5be72426bde45abadef66d7d6edf3",
  },
  // fantom: {
  //   factory: "0x9b7e30644a9b37eebaa7158129b03f5a3088659d",
  // },
  // pulse: {
  //   factory: "0xac297968C97EF5686c79640960D106f65C307a37",
  // },
  // base: {
  //   factory: "0x714c94b9820d7d73e61510e4c18b91f995a895c1",
  // },
  // arbitrum: {
  //   factory: "0xe31fceaf93667365ce1e9edad3bed4a7dd0fc01a",
  // },
  // avax: {
  //   factory: "0x6b714e6296b8b977e1d5ecb595197649e10a3db1",
  // },
  // bsc: {
  //   factory: "0x3ace08b10b5c08a17d1c46277d65c81249e65f44",
  // },
  // manta: {
  //   factory: "0x714C94B9820D7D73e61510e4C18B91F995A895C1",
  // },
};

const getVaults = async (api, factory) => {
  const vaultLists = await api.fetchList({
    lengthAbi: abi.factory.vaultsLength,
    itemAbi: abi.factory.vaults,
    target: factory,
  });

  return Promise.all(
    vaultLists.map(async (vault) => {
      const farmRes = await api.fetchList({
        lengthAbi: abi.vault.farmsLength,
        itemAbi: abi.vault.farms,
        target: vault,
      });

      const farms = farmRes.map(({ beacon, percent }) => ({ beacon, percent }));
      return { vault, farms };
    })
  );
};

const getVaultsConnectors = async (api, factory, vaults) => {
  const connectorsCalls = [];
  const calculationConnectorCalls = [];

  vaults.forEach(({ vault, farms }) => {
    farms.forEach((farm) => {
      connectorsCalls.push({ target: vault, params: [farm.beacon] });
      calculationConnectorCalls.push({
        target: factory,
        params: [farm.beacon],
      });
    });
  });

  const [connectors, calculationConnectors] = await Promise.all([
    api.multiCall({
      calls: connectorsCalls,
      abi: abi.vault.farmConnector,
    }),
    api.multiCall({
      calls: calculationConnectorCalls,
      abi: abi.factory.farmCalculationConnector,
    }),
  ]);

  let connectorIndex = 0;
  return vaults.map((vaultWithFarms) => {
    const updatedFarms = vaultWithFarms.farms.map((farm) => ({
      ...farm,
      calculationConnector: calculationConnectors[connectorIndex],
      connector: connectors[connectorIndex++],
    }));

    return { ...vaultWithFarms, farms: updatedFarms };
  });
};

const getVaultsDatas = async (api, vaults) => {
  const calls = vaults.flatMap(({ farms }) =>
    farms.map((farm) => ({ target: farm.connector }))
  );

  const [types, versions, stakingTokens, gauges] = await Promise.all([
    api.multiCall({ calls, abi: abi.farm.type }),
    api.multiCall({ calls, abi: abi.farm.version }),
    api.multiCall({ calls, abi: abi.farm.stakingToken }),
    api.multiCall({ calls, abi: abi.farm.farm }),
  ]);

  let callsIndex = 0;
  return vaults.map((vault) => {
    const updatedFarms = vault.farms.map((farm) => ({
      ...farm,
      type: types[callsIndex],
      version: versions[callsIndex],
      gauge: gauges[callsIndex],
      stakingToken: stakingTokens[callsIndex++],
    }));

    return { ...vault, farms: updatedFarms };
  });
};

const getVaultsBalances = async (api, vaults) => {
  const calls = vaults.flatMap(({ farms }) =>
    farms.map(({ calculationConnector, connector }) => ({
      target: calculationConnector,
      params: [connector],
    }))
  );

  const liquidities = await api.multiCall({ calls, abi: abi.vault.liquidity });

  let callsIndex = 0;
  return vaults.map((vault) => {
    const updatedFarms = vault.farms.map((farm) => ({
      ...farm,
      liquidity: liquidities[callsIndex++],
    }));

    return { ...vault, farms: updatedFarms };
  });
};

const tvl = async (api, factory) => {
  const vaults = await getVaults(api, factory);
  const vaultsConnectors = await getVaultsConnectors(api, factory, vaults);
  const updatedVaults = await getVaultsDatas(api, vaultsConnectors);
  const vaultsBalances = await getVaultsBalances(api, updatedVaults);
};

Object.keys(CONFIG).forEach((chain) => {
  const { factory } = CONFIG[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      await tvl(api, factory);
    },
  };
});
