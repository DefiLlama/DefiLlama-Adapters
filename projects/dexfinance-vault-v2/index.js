const ADDRESSES = require('../helper/coreAssets.json');
const { abi } = require("../dexfinance-vault/abi");
const { sumTokens2 } = require('../helper/unwrapLPs');

const CONFIG = {
  sonic: {
    factory: "0x095d35c49d2d0ea2eba3e2f9e377966db35af7e2",
  },
  avax: {
    factory: "0x5764dad2fd4b6918949c6ae86081819ca8c19749",
  },
  bsc: {
    factory: "0xc9dc65aed28bdb016726d32d0f8c2cd5c9461961",
  },
  ethereum: {
    factory: "0x4c1a8a04577286ce58d0723b1a90160f380e550a",
  },
  base: {
    factory: "0xcb34f261a5284554bb9fea8aa12a0578c4ba3fc6",
  },
  arbitrum: {
    factory: "0x061f8132b344cb2a32d3895eb3ebc2ff87455f79",
  },
};

const GDEX_TOKEN = "0x53Cb59D32a8d08fC6D3f81454f150946A028A44d";
const STAKING_CONTRACT = "0xd7D11E2d4E8E7b65E905aa9d16E488C37195Ca62";
const POOL_ADDRESS = "0x65B6ee9CaC744D4eed9886406EAD6bc4E5681068";

const getVaults = async (api, factory) => {
  const vaults = await api.fetchList({ lengthAbi: abi.factory.vaultsLength, itemAbi: abi.factory.vaults, target: factory, permitFailure: true });
  const farmsAll = await api.fetchList({ lengthAbi: abi.vault.farmsLength, itemAbi: abi.vault.farms, targets: vaults, groupedByInput: true, permitFailure: true });

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
      const connector = connectors[i];
      const calculationConnector = calculationConnectors[i];
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
  const stakingDatasCalls = vaultFarms.map(({ calculationConnector }) => ({ target: calculationConnector }));

  const [stakingTokens, liquidities, datas] = await Promise.all([
    api.multiCall({ calls, abi: abi.farm.stakingToken, permitFailure: true }),
    api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity }),
    api.multiCall({ calls: stakingDatasCalls, abi: abi.farm.stakingTokenData, permitFailure: true })
  ]);

  vaultFarms.forEach((item, i) => {
    const stakingToken = stakingTokens[i];
    const liquidity = liquidities[i];
    const data = datas[i];
    if (!stakingToken || !liquidity) return;
    if (!data) {
      v2Farms.push({ ...item, stakingToken, liquidity });
    } else {
      v3Farms.push({ ...item, stakingToken, liquidity, data });
    }
  });

  return { v2Farms, v3Farms };
};

async function addERC721Data(api, vaultFarms) {
  const positionIds = await api.multiCall({ abi: abi.farm.tokenId, calls: vaultFarms.map(i => i.connector) });
  const nftPositionMapping = {};
  vaultFarms.forEach((item, i) => {
    if (!+positionIds[i]) return;
    const nft = item.stakingToken.toLowerCase();
    if (!nftPositionMapping[nft]) nftPositionMapping[nft] = [];
    nftPositionMapping[nft].push(positionIds[i]);
  });
  for (const [nftAddress, positionIds] of Object.entries(nftPositionMapping))
    await sumTokens2({ api, uniV3ExtraConfig: { nftAddress, positionIds } });
}

const getChainFarms = async (api) => {
  const { factory } = CONFIG[api.chain];
  const vaultFarms = await getVaults(api, factory);
  const vaultFarmsWithConnectors = await getVaultsConnectors(api, factory, vaultFarms);
  return getVaultsDatas(api, vaultFarmsWithConnectors);
};

const tvl = async (api) => {
  const { v2Farms, v3Farms } = await getChainFarms(api);
  v2Farms.forEach(({ stakingToken, liquidity }) => api.add(stakingToken, liquidity));
  await addERC721Data(api, v3Farms);
  await sumTokens2({ api, resolveLP: true });
};

module.exports = {
  hallmarks: [
    ['2025-04-12', "Launch on Base"],
    ['2025-05-03', "Launch on Sonic"],
    ['2025-08-12', "Launch on Avalanche"],
    ['2025-10-03', "Launch on BNB Chain"],
    ['2026-01-29', "Launch on Ethereum"],
    ['2026-02-17', "Launch on Arbitrum"],
  ],
  sonic:    { tvl },
  avax:     { tvl },
  bsc:      { tvl },
  ethereum: { tvl },
  base:     {
    tvl: async (api) => {
      await tvl(api)
      await sumTokens2({ api, tokens: [ADDRESSES.base.WETH], owners: [POOL_ADDRESS] })
      api.removeTokenBalance(GDEX_TOKEN)
    },
    staking: async (api) => {
      await sumTokens2({ api, tokens: [GDEX_TOKEN], owners: [STAKING_CONTRACT, POOL_ADDRESS] })
      // gDEX from vault farm LPs
      const { v2Farms } = await getChainFarms(api);
      v2Farms.forEach(({ stakingToken, liquidity }) => {
        if (stakingToken.toLowerCase() === GDEX_TOKEN.toLowerCase()) api.add(GDEX_TOKEN, liquidity)
      });
    },
  },
  arbitrum: { tvl },
};