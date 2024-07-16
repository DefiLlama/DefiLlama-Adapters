const { abi } = require("./abi");
const { getLogs } = require("../helper/cache/getLogs");

const CONFIG = {
  optimism: {
    factory: "0xd4f1a99212e5be72426bde45abadef66d7d6edf3",
  },
};

const getVaults = async (api, factory) => {
  const vaultsLists = await api.fetchList({
    lengthAbi: abi.factory.vaultsLength,
    itemAbi: abi.factory.vaults,
    target: factory,
  });

  return Promise.all(
    vaultsLists.map(async (vault) => {
      const farmLists = await api.fetchList({
        lengthAbi: abi.vault.farmsLength,
        itemAbi: abi.vault.farms,
        target: vault,
      });

      return {
        vault,
        farms: farmLists.map(({ beacon, percent }) => ({
          beacon,
          percent,
        })),
      };
    })
  );
};

const getVaultsDatas = async (api, vaults, factory) => {
  const connectorCalls = vaults.flatMap(({ farms }) =>
    farms.map((farm) => ({ target: factory, params: [farm.beacon] }))
  );

  const connectors = await api.multiCall({
    calls: connectorCalls,
    abi: abi.factory.farmCalculationConnector,
  });

  let connectorIndex = 0;
  const updatedVaults = vaults.map((vault) => ({
    ...vault,
    farms: vault.farms.map((farm) => ({
      ...farm,
      connector: connectors[connectorIndex++],
    })),
  }));

  const stakingTokensCalls = updatedVaults.flatMap(({ farms }) =>
    farms.map((farm) => ({ target: farm.connector }))
  );

  const [stakingTokens, gauges] = await Promise.all([
    api.multiCall({
      calls: stakingTokensCalls,
      abi: abi.farm.stakingToken,
    }),
    api.multiCall({
      calls: stakingTokensCalls,
      abi: abi.farm.farm,
    }),
  ]);

  let tokenIndex = 0;
  const finalVaults = updatedVaults.map((vault) => ({
    ...vault,
    farms: vault.farms.map((farm) => ({
      ...farm,
      stakingToken: stakingTokens[tokenIndex],
      gauge: gauges[tokenIndex++],
    })),
  }));

  return finalVaults;
};

const createTvl = async (api, factory) => {
  const vaults = await getVaults(api, factory);
  const vaultsDatas = await getVaultsDatas(api, vaults, factory);

  for (const vaultsData of vaultsDatas) {
    if (
      vaultsData.vault.toLowerCase() ===
      "0xf24425cfc53F292379C3dF5B53a12B16E6E1dDFc".toLowerCase()
    ) {
      console.log(vaultsData);
    }
  }
};

Object.keys(CONFIG).forEach((chain) => {
  const { factory } = CONFIG[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      await createTvl(api, factory);
    },
  };
});
