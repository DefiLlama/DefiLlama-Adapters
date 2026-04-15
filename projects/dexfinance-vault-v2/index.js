const ADDRESSES = require('../helper/coreAssets.json');
const { abi } = require("../dexfinance-vault/abi");
const { sumTokens2, unwrapSlipstreamNFT, unwrapUniswapV3NFT } = require('../helper/unwrapLPs');

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

const getVaultsConnectors = async (api, vaultFarms) => {
  const connectorsCalls = vaultFarms.map(({ farm, vault }) => ({ params: farm.beacon, target: vault }));
  const connectors = await api.multiCall({ abi: abi.vault.farmConnector, calls: connectorsCalls, permitFailure: true });

  return vaultFarms
    .map((item, i) => {
      const connector = connectors[i];
      if (!connector) return null;
      delete item.farm.data;
      return { ...item, connector };
    }).filter(item => item !== null);
};

const getChainFarms = async (api) => {
  const { factory } = CONFIG[api.chain];
  const vaultFarms = await getVaults(api, factory);
  const vaultFarmsWithConnectors = await getVaultsConnectors(api, vaultFarms);

  const calls = vaultFarmsWithConnectors.map(({ connector }) => connector);
  const [stakingTokens, tokenIds] = await Promise.all([
    api.multiCall({ calls, abi: abi.farm.stakingToken, permitFailure: true }),
    api.multiCall({ calls, abi: abi.farm.tokenId, permitFailure: true }),
  ]);

  const nftFarms = [];
  const tokenFarms = [];
  vaultFarmsWithConnectors.forEach((item, i) => {
    if (!stakingTokens[i]) return;
    if (tokenIds[i] && +tokenIds[i] > 0) {
      nftFarms.push({ ...item, stakingToken: stakingTokens[i], tokenId: tokenIds[i] });
    } else {
      tokenFarms.push({ ...item, stakingToken: stakingTokens[i] });
    }
  });

  return { nftFarms, tokenFarms };
};

const tvl = async (api) => {
  const { nftFarms, tokenFarms } = await getChainFarms(api);

  // NFT positions
  const nftPositionMapping = {};
  nftFarms.forEach(({ stakingToken, tokenId }) => {
    const nft = stakingToken.toLowerCase();
    if (!nftPositionMapping[nft]) nftPositionMapping[nft] = [];
    nftPositionMapping[nft].push(tokenId);
  });
  const nftAddresses = Object.keys(nftPositionMapping);
  const [factoryResults, deployerResults, poolManagerResults] = await Promise.all([
    api.multiCall({ calls: nftAddresses, abi: 'address:factory', permitFailure: true }),
    api.multiCall({ calls: nftAddresses, abi: 'address:deployer', permitFailure: true }),
    api.multiCall({ calls: nftAddresses, abi: 'address:poolManager', permitFailure: true }),
  ]);

  // detect Shadow: deployer exists AND deployer has RamsesV3Factory
  const deployersToCheck = deployerResults.map((d, i) => d ? { target: d, idx: i } : null).filter(Boolean);
  const ramsesFactoryResults = deployersToCheck.length
    ? await api.multiCall({ calls: deployersToCheck.map(d => d.target), abi: 'address:RamsesV3Factory', permitFailure: true })
    : [];
  const shadowSet = new Set();
  deployersToCheck.forEach((d, j) => { if (ramsesFactoryResults[j]) shadowSet.add(d.idx); });

  // detect Slipstream and Algebra from factory
  const factoriesWithIndex = factoryResults.map((f, i) => f ? { target: f, idx: i } : null).filter(Boolean);
  const [poolImplResults, poolByPairResults] = factoriesWithIndex.length ? await Promise.all([
    api.multiCall({ calls: factoriesWithIndex.map(f => f.target), abi: 'address:poolImplementation', permitFailure: true }),
    api.multiCall({ calls: factoriesWithIndex.map(f => ({ target: f.target, params: [ADDRESSES.null, ADDRESSES.null] })), abi: 'function poolByPair(address, address) view returns (address)', permitFailure: true }),
  ]) : [[], []];
  const slipstreamSet = new Set();
  const algebraSet = new Set();
  factoriesWithIndex.forEach((f, j) => {
    if (poolImplResults[j]) slipstreamSet.add(f.idx);
    else if (poolByPairResults[j] !== null && poolByPairResults[j] !== undefined) algebraSet.add(f.idx);
  });

  for (let i = 0; i < nftAddresses.length; i++) {
    const positionIds = nftPositionMapping[nftAddresses[i]];
    if (shadowSet.has(i)) {
      await unwrapSlipstreamNFT({ api, nftAddress: nftAddresses[i], positionIds, isShadow: true });
    } else if (slipstreamSet.has(i)) {
      await unwrapSlipstreamNFT({ api, nftAddress: nftAddresses[i], positionIds });
    } else if (algebraSet.has(i)) {
      await unwrapUniswapV3NFT({ api, nftAddress: nftAddresses[i], uniV3ExtraConfig: { positionIds }, isAlgebra: true });
    } else if (poolManagerResults[i]) {
      await sumTokens2({ api, uniV4ExtraConfig: { nftAddress: nftAddresses[i], positionIds } });
    } else if (factoryResults[i]) {
      await sumTokens2({ api, uniV3ExtraConfig: { nftAddress: nftAddresses[i], positionIds } });
    }
  }

  // ERC20 tokens and LPs
  const liquidityCalls = tokenFarms.map(({ connector }) => ({ target: connector, params: [connector] }));
  const liquidities = await api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity, permitFailure: true });
  tokenFarms.forEach(({ stakingToken }, i) => {
    if (liquidities[i]) api.add(stakingToken, liquidities[i]);
  });
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
      // gDEX held directly by vault farm connectors
      const { tokenFarms } = await getChainFarms(api);
      const liquidityCalls = tokenFarms.map(({ connector }) => ({ target: connector, params: [connector] }));
      const liquidities = await api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity, permitFailure: true });
      tokenFarms.forEach(({ stakingToken }, i) => {
        if (liquidities[i] && stakingToken.toLowerCase() === GDEX_TOKEN.toLowerCase())
          api.add(GDEX_TOKEN, liquidities[i]);
      });
    },
  },
  arbitrum: { tvl },
};
