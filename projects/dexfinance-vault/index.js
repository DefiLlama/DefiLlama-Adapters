const { abi } = require("./abi");
const { sumTokens2, addUniV3LikePosition } = require("../helper/unwrapLPs");

const CONFIG = {
  optimism: {
    factory: "0xd4f1a99212e5be72426bde45abadef66d7d6edf3",
  },
  fantom: {
    factory: "0x9b7e30644a9b37eebaa7158129b03f5a3088659d",
  },
  pulse: {
    factory: "0xac297968C97EF5686c79640960D106f65C307a37",
  },
  arbitrum: {
    factory: "0xe31fceaf93667365ce1e9edad3bed4a7dd0fc01a",
  },
  avax: {
    factory: "0x6b714e6296b8b977e1d5ecb595197649e10a3db1",
  },
  bsc: {
    factory: "0x3ace08b10b5c08a17d1c46277d65c81249e65f44",
  },
  // manta: {
  //   factory: "0x714C94B9820D7D73e61510e4C18B91F995A895C1",
  // },
  // base: {
  //   factory: "0x714c94b9820d7d73e61510e4c18b91f995a895c1",
  // },
};

const getVaults = async (api, factory) => {
  const vaultLists = await api.fetchList({
    lengthAbi: abi.factory.vaultsLength,
    itemAbi: abi.factory.vaults,
    target: factory,
    permitFailure: true,
  });

  return Promise.all(
    vaultLists.map(async (vault) => {
      const farmRes = await api.fetchList({
        lengthAbi: abi.vault.farmsLength,
        itemAbi: abi.vault.farms,
        target: vault,
        permitFailure: true,
      });

      const farms = farmRes
        .filter((i) => i !== null)
        .map(({ beacon, percent }) => ({ beacon, percent }));

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

  const [types, stakingTokens, gauges, tokenIds] = await Promise.all([
    api.multiCall({ calls, abi: abi.farm.type }),
    api.multiCall({ calls, abi: abi.farm.stakingToken }),
    api.multiCall({ calls, abi: abi.farm.farm }),
    api.multiCall({ calls, abi: abi.farm.tokenId, permitFailure: true }),
  ]);

  let callsIndex = 0;
  return vaults.map((vault) => {
    const updatedFarms = vault.farms.map((farm) => ({
      ...farm,
      type: types[callsIndex],
      gauge: gauges[callsIndex],
      tokenId: tokenIds[callsIndex] ?? 0,
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

const groupBy = (array, keyFn) => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
};

const lpv2Balances = async (api, farms) => {
  farms.forEach(({ stakingToken, liquidity }) => {
    api.add(stakingToken, liquidity);
  });
};

const sqrtPriceX96ToPrice = (sqrtPriceX96) => {
  const Q96 = 2 ** 96;
  return (sqrtPriceX96 / Q96) ** 2;
};

const priceToTick = (price) => Math.log(price) / Math.log(1.0001);

const lpv3Balances = async (api, farms) => {
  const calls = farms
    .filter(({ tokenId }) => tokenId != 0)
    .map(({ connector, tokenId }) => ({
      target: connector,
      params: [tokenId],
    }));

  const [liquidityV3, stakingTokenDataV3] = await Promise.all([
    api.multiCall({
      calls,
      abi: abi.farm.stakingTokenLiquidity,
    }),
    api.multiCall({
      calls: farms
        .filter(({ tokenId }) => tokenId != 0)
        .map(({ connector }) => ({ target: connector })),
      abi: abi.farm.stakingTokenData,
    }),
  ]);

  const dataV3 = stakingTokenDataV3.map((data, index) => {
    const sqrtPriceX96LowInit = Number(data.pricesData.sqrtPriceX96LowInit);
    const priceLowInit = sqrtPriceX96ToPrice(sqrtPriceX96LowInit);
    const tick = priceToTick(priceLowInit);

    return {
      token0: data.token0,
      token1: data.token1,
      liquidity: liquidityV3[index],
      tickLower: data.tickLower,
      tickUpper: data.tickUpper,
      tick,
    };
  });

  dataV3.forEach((position) => {
    addUniV3LikePosition({
      api,
      token0: position.token0,
      token1: position.token1,
      liquidity: position.liquidity,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      tick: position.tick,
    });
  });
};

const tvl = async (api, factory) => {
  const vaults = await getVaults(api, factory);
  const vaultsConnectors = await getVaultsConnectors(api, factory, vaults);
  const updatedVaults = await getVaultsDatas(api, vaultsConnectors);
  const vaultsBalances = await getVaultsBalances(api, updatedVaults);

  const farms = vaultsBalances.flatMap((vault) => vault.farms);
  const sortedFarms = groupBy(farms, ({ type }) => `${type}`);

  const lpv2Farms = Object.keys(sortedFarms)
    .filter((key) => !key.includes("ERC721"))
    .flatMap((key) => sortedFarms[key]);

  const lpv3Farms = Object.keys(sortedFarms)
    .filter((key) => key.includes("ERC721"))
    .flatMap((key) => sortedFarms[key]);

  await lpv2Balances(api, lpv2Farms);
  await lpv3Balances(api, lpv3Farms);

  return sumTokens2({ api, resolveLP: true });
};

Object.keys(CONFIG).forEach((chain) => {
  const { factory } = CONFIG[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      await tvl(api, factory);
    },
  };
});
