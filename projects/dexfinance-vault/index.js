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
    USDEX_PLUS: "0xaa2c47a35c1298795b5271490971ec4874c8e53d",
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
  manta: {
    factory: "0x714C94B9820D7D73e61510e4C18B91F995A895C1",
    USDEX_PLUS: '0x6da9ebd271a0676f39c088a2b5fd849d5080c0af',
  },
};

const getVaults = async (api, factory) => {
  const vaults = await api.fetchList({ lengthAbi: abi.factory.vaultsLength, itemAbi: abi.factory.vaults, target: factory, permitFailure:true });
  const farmsAll = await api.fetchList({ lengthAbi: abi.vault.farmsLength, itemAbi: abi.vault.farms, targets: vaults, groupedByInput: true, permitFailure:true })

  return vaults.map((vault, i) => {
    const farms = farmsAll[i] || [];
    return farms.map(farm => ({ vault, farm }));
  }).flat();
};

const getVaultsConnectors = async (api, factory, vaultFarms) => {
  const connectorsCalls = vaultFarms.map(({ farm, vault }) => ({ params: farm.beacon, target: vault }));
  const calculationConnectorCalls = vaultFarms.map(({ farm }) => farm.beacon);
  const connectors = await api.multiCall({ abi: abi.vault.farmConnector, calls: connectorsCalls, permitFailure: true });
  const calculationConnectors = await api.multiCall({ abi: abi.factory.farmCalculationConnector, calls: calculationConnectorCalls, target: factory, permitFailure: true });

  return vaultFarms
    .map((item, i) => {
      const connector = connectors[i]
      const calculationConnector = calculationConnectors[i]
      if (!connector || !calculationConnector) return null;
      delete item.farm.data;
      return { ...item, connector, calculationConnector };
    }).filter(item => item !== null);
};

const getVaultsDatas = async (api, vaultFarms) => {
  const v2Farms = [];
  const v3Farms = [];
  const calls = vaultFarms.map(({ connector }) => connector);
  const liquidityCalls = vaultFarms.map(({ calculationConnector, connector }) => ({ target: calculationConnector, params: [connector] }));
  const stakingDatasCalls = vaultFarms.map(({ calculationConnector }) => ({ target: calculationConnector }))

  const [stakingTokens, liquidities, datas] = await Promise.all([
    api.multiCall({ calls, abi: abi.farm.stakingToken, permitFailure: true }),
    api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity }),
    api.multiCall({ calls: stakingDatasCalls, abi: abi.farm.stakingTokenData, permitFailure: true })
  ]);

  vaultFarms.forEach(( item, i ) => {
    const stakingToken = stakingTokens[i]
    const liquidity = liquidities[i]
    const data = datas[i]
    if (!stakingToken || !liquidity ) return
    if (!data) {
      v2Farms.push({ ...item, stakingToken, liquidity })
    } else {
      v3Farms.push({ ...item, stakingToken, liquidity, data })
    }
  })

  return { v2Farms, v3Farms }
};

const lpv2Balances = async (api, farms) => {
  farms.forEach(({ stakingToken, liquidity }) => {
    api.add(stakingToken, liquidity);
  });
};

async function addERC721Data(api, vaultFarms) {
  const positionIds = await api.multiCall({ abi: abi.farm.tokenId, calls: vaultFarms.map(i => i.connector) })
  const nftPositionMapping = {}
  vaultFarms.forEach((item, i) => {
    if (!+positionIds[i])
      return;

    const nft = item.stakingToken.toLowerCase()
    if (!nftPositionMapping[nft]) nftPositionMapping[nft] = []
    nftPositionMapping[nft].push(positionIds[i])
  })
  for (const [nftAddress, positionIds] of Object.entries(nftPositionMapping))
    await sumTokens2({ api, uniV3ExtraConfig: { nftAddress, positionIds } })
}

const tvl = async (api) => {
  const { factory, USDEX_PLUS, gDEX } = CONFIG[api.chain];
  const vaultFarms = await getVaults(api, factory);
  const vaultFarmsWithConnectors = await getVaultsConnectors(api, factory, vaultFarms);
  const { v2Farms, v3Farms } = await getVaultsDatas(api, vaultFarmsWithConnectors);

    await Promise.all([
    lpv2Balances(api, v2Farms),
    addERC721Data(api, v3Farms)
  ])

  await sumTokens2({ api, resolveLP: true });
  if (USDEX_PLUS) api.removeTokenBalance(USDEX_PLUS);
  if (gDEX) api.removeTokenBalance(gDEX);
};

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl };
})