const { sumTokens2, addUniV3LikePosition } = require("../helper/unwrapLPs");
const { abi } = require("./abi");

const CONFIG = {
  optimism: {
    factory: "0xd4f1a99212e5be72426bde45abadef66d7d6edf3",
  },
  fantom: {
    factory: "0x9b7e30644a9b37eebaa7158129b03f5a3088659d",
  },
  pulse: {
    factory: "0xac297968C97EF5686c79640960D106f65C307a37",
    USDEX_PLUS: "0xaA2C47a35C1298795B5271490971Ec4874C8e53d",
  },
  base: {
    factory: "0x714c94b9820d7d73e61510e4c18b91f995a895c1",
  },
  arbitrum: {
    factory: "0xe31fceaf93667365ce1e9edad3bed4a7dd0fc01a",
    USDEX_PLUS: "0x4117EC0A779448872d3820f37bA2060Ae0B7C34B",
    gDEX: "0x92a212d9f5eef0b262ac7d84aea64a0d0758b94f"
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
};

const getVaults = async (api, factory) => {
  const vaults = await api.fetchList({ lengthAbi: abi.factory.vaultsLength, itemAbi: abi.factory.vaults, target: factory, });
  const farmsAll = await api.fetchList({ lengthAbi: abi.vault.farmsLength, itemAbi: abi.vault.farms, targets: vaults, groupedByInput: true })
  const items = []
  vaults.map((vault, i) => items.push(farmsAll[i].map((farm) => ({ vault, farm }))))
  return items.flat()
};

const getVaultsConnectors = async (api, factory, vaultFarms) => {
  const connectorsCalls = vaultFarms.map(({ farm, vault }) => ({ params: farm.beacon, target: vault, }));
  const calculationConnectorCalls = vaultFarms.map(({ farm }) => farm.beacon);
  const connectors = await api.multiCall({ abi: abi.vault.farmConnector, calls: connectorsCalls })
  const calculationConnectors = await api.multiCall({ abi: abi.factory.farmCalculationConnector, calls: calculationConnectorCalls, target: factory })

  vaultFarms.forEach((item, i) => {
    delete item.farm.data
    item.connector = connectors[i]
    item.calculationConnector = calculationConnectors[i]
  })
}

const getVaultsDatas = async (api, vaultFarms) => {
  const calls = vaultFarms.map(({ connector }) => connector)
  const liquidityCalls = vaultFarms.map(({ calculationConnector, connector }) => ({ target: calculationConnector, params: [connector] }))

  const [types, stakingTokens, tokenIds, liquidities] =
    await Promise.all([
      api.multiCall({ calls, abi: abi.farm.type }),
      api.multiCall({ calls, abi: abi.farm.stakingToken }),
      api.multiCall({ calls, abi: abi.farm.tokenId, permitFailure: true }),
      api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity }),
    ]);

  vaultFarms.forEach((item, i) => {
    item.type = types[i]
    item.stakingToken = stakingTokens[i]
    item.liquidity = liquidities[i]
    item.tokenId = tokenIds[i]
  })
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

const lpv3Balances = async (api, farms) => {
  const Q96 = 2 ** 96;
  const priceToTick = (price) => Math.log(price) / Math.log(1.0001);
  const sqrtPriceX96ToPrice = (sqrtPriceX96) => (sqrtPriceX96 / Q96) ** 2;

  const calls = farms.filter(({ tokenId }) => tokenId !== 0).map(({ connector, tokenId }) => ({ target: connector, params: [tokenId] }));
  const callsDataV3 = farms.filter(({ tokenId }) => tokenId !== 0).map(({ connector }) => ({ target: connector }))

  const [liquidityV3, stakingTokenDataV3] = await Promise.all([
    api.multiCall({ calls, abi: abi.farm.stakingTokenLiquidity, permitFailure: true }),
    api.multiCall({ calls: callsDataV3, abi: abi.farm.stakingTokenData, permitFailure: true }),
  ]);

  farms.forEach((_, index) => {
    const liquidity = liquidityV3[index];
    const data = stakingTokenDataV3[index];

    if (liquidity && data) {
      const sqrtPriceX96LowInit = Number(data.pricesData.sqrtPriceX96LowInit);
      const sqrtPriceX96UpInit = Number(data.pricesData.sqrtPriceX96UpInit);

      const avgPrice = (sqrtPriceX96ToPrice(sqrtPriceX96LowInit) + sqrtPriceX96ToPrice(sqrtPriceX96UpInit)) / 2;
      const tick = priceToTick(avgPrice);

      addUniV3LikePosition({
        api,
        token0: data.token0,
        token1: data.token1,
        liquidity,
        tickLower: data.tickLower,
        tickUpper: data.tickUpper,
        tick,
      });
    }
  });
};

const tvl = async (api) => {
  const { factory, USDEX_PLUS, gDEX } = CONFIG[api.chain];
  const vaultFarms = await getVaults(api, factory);
  await getVaultsConnectors(api, factory, vaultFarms);
  await getVaultsDatas(api, vaultFarms);
  const sortedFarms = groupBy(vaultFarms, ({ type }) => `${type}`);

  const lpv2Farms = Object.keys(sortedFarms)
    .filter((key) => !key.includes("ERC721"))
    .flatMap((key) => sortedFarms[key]);

  const lpv3Farms = Object.keys(sortedFarms)
    .filter((key) => key.includes("ERC721"))
    .flatMap((key) => sortedFarms[key]);

  await Promise.all([
    lpv2Balances(api, lpv2Farms),
    lpv3Balances(api, lpv3Farms)
  ])

  if (USDEX_PLUS) api.removeTokenBalance(USDEX_PLUS);
  if (gDEX) api.removeTokenBalance(gDEX);
  return sumTokens2({ api, resolveLP: true });
};

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl, };
})