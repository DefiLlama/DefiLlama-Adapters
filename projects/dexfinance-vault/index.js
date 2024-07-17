const { sumTokens2 } = require("../helper/unwrapLPs");
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
  },
  base: {
    factory: "0x714c94b9820d7d73e61510e4c18b91f995a895c1",
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
  manta: {
    factory: "0x714C94B9820D7D73e61510e4C18B91F995A895C1",
  },
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

  const [types, versions, stakingTokens, gauges, liquidities] = await Promise.all([
    api.multiCall({ calls, abi: abi.farm.type }),
    api.multiCall({ calls, abi: abi.farm.version }),
    api.multiCall({ calls, abi: abi.farm.stakingToken }),
    api.multiCall({ calls, abi: abi.farm.farm }),
    api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity }),
  ]);
  vaultFarms.forEach((item, i) => {
    item.type = types[i]
    item.version = versions[i]
    item.stakingToken = stakingTokens[i]
    item.gauge = gauges[i]
    item.liquidity = liquidities[i]
  })
};

async function addERC721Data(api, vaultFarms) {
  vaultFarms = vaultFarms.filter(({ type }) => type === 'ERC721')
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
    await sumTokens2({ api, uniV3ExtraConfig: { nftAddress, positionIds, } })
}

const tvl = async (api, factory) => {
  const vaultFarms = await getVaults(api, factory);
  await getVaultsConnectors(api, factory, vaultFarms);
  await getVaultsDatas(api, vaultFarms);
  // console.log(vaultFarms.filter(({ type, version, liquidity, }) => !['LP', 'ERC20', 'SINGLE-LP',].includes(type)), api.chain)
  const dataTypes = new Set(vaultFarms.map(({ type, version }) => type + '-' + version))
  api.log(dataTypes, api.chain)
  await addERC721Data(api, vaultFarms)
  vaultFarms.forEach((item) => {
    if (['LP', 'SINGLE-LP'].includes(item.type) && +item.liquidity > 0) {
      api.add(item.stakingToken, item.liquidity)
    }
  })
  return sumTokens2({ api, resolveLP: true, })
};

Object.keys(CONFIG).forEach((chain) => {
  const { factory } = CONFIG[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      await tvl(api, factory);
    },
  };
});

// module.exports = {
//   arbitrum: module.exports.arbitrum
// }