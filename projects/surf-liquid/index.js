const { getLogs2 } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json')
const V2_FACTORY = "0x1D283b668F947E03E8ac8ce8DA5505020434ea0E";
const V3_FACTORY = "0xf1d64dee9f8e109362309a4bfbb523c8e54fa1aa";
const SURF_STAKING = "0xB0fDFc081310A5914c2d2c97e7582F4De12FA9d6";
const SURF_TOKEN = "0xcdca2eaae4a8a6b83d7a3589946c2301040dafbf";
const USDC = ADDRESSES.base.USDC;
const WETH = ADDRESSES.optimism.WETH_1;
const CBBTC = ADDRESSES.ethereum.cbBTC;
const ASSETS = [USDC, WETH, CBBTC];
const ZERO_ADDR = ADDRESSES.null;

// V4 — UserVaultFactory + VaultRegistry (same addresses on every chain via CREATE2)
const V4_FACTORY = "0x8fa50DeA8DB10987D7d22ac092001c3613C18779";
const V4_REGISTRY = "0x98A0DeF9C959Ec934Df02141291303819369f271";
const V4_FROM_BLOCKS = {
  base: 43860256,
  ethereum: 24740207,
  arbitrum: 445775166,
  polygon: 84694976,
};

const ABI = {
  getTotalVaults: "uint256:getTotalVaults",
  getVaultInfo: "function getVaultInfo(uint256) view returns (address, address, address, uint256, bytes32, uint256)",
  currentVault: "address:currentVault",
  assetToVault: "function assetToVault(address) view returns (address)",
  getAllowedAssets: "function getAllowedAssets() view returns (address[])",
  v3VaultDeployed: "event VaultDeployed(address indexed vaultAddress, address indexed owner, address indexed pool, bytes32 marketId, uint256 chainId)",
  v4VaultDeployed: "event VaultDeployed(address indexed vaultAddress, address indexed owner, bytes32 salt)",
  totalStaked: "uint256:totalStaked",
  balanceOf: "erc20:balanceOf",
};

async function discoverVaults(api, factory, eventAbi, fromBlock) {
  const logs = await getLogs2({
    api,
    target: factory,
    eventAbi,
    fromBlock,
  })
  return logs.map((l) => l.vaultAddress);
}

async function pushMorphoShares(api, surfVaults, assetList, tokensAndOwners) {
  for (const asset of assetList) {
    const morphoVaults = await api.multiCall({
      abi: ABI.assetToVault,
      calls: surfVaults.map((v) => ({ target: v, params: [asset] })),
      permitFailure: true,
    });
    for (let i = 0; i < surfVaults.length; i++) {
      if (morphoVaults[i] && morphoVaults[i] !== ZERO_ADDR) {
        tokensAndOwners.push([morphoVaults[i], surfVaults[i]]);
      }
    }
  }
}

function pushIdleUnderlying(surfVaults, assetList, tokensAndOwners) {
  for (const owner of surfVaults) {
    for (const asset of assetList) {
      tokensAndOwners.push([asset, owner]);
    }
  }
}

async function tvl(api) {
  const tokensAndOwners = [];

  // V2: enumerate via factory, push (Morpho vault, surf vault) pairs
  const totalV2 = await api.call({ abi: ABI.getTotalVaults, target: V2_FACTORY });
  const v2Infos = await api.multiCall({
    abi: ABI.getVaultInfo,
    calls: [...Array(Number(totalV2)).keys()].map((i) => ({ target: V2_FACTORY, params: [i] })),
  });
  const v2Owners = v2Infos.map((info) => info[0]);
  const v2MorphoVaults = await api.multiCall({
    abi: ABI.currentVault,
    calls: v2Owners.map((target) => ({ target })),
  });
  for (let i = 0; i < v2Owners.length; i++) {
    if (v2Owners[i] && v2Owners[i] !== ZERO_ADDR && v2MorphoVaults[i] && v2MorphoVaults[i] !== ZERO_ADDR) {
      tokensAndOwners.push([v2MorphoVaults[i], v2Owners[i]]);
    }
  }

  // V3: discover via factory events, push (Morpho vault, surf vault) pairs per asset
  const v3Vaults = await discoverVaults(api, V3_FACTORY, ABI.v3VaultDeployed, 38856207);
  await pushMorphoShares(api, v3Vaults, ASSETS, tokensAndOwners);

  // Idle underlying at all surf vaults (V2 + V3)
  const allSurfVaults = [...v2Owners.filter((a) => a && a !== ZERO_ADDR), ...v3Vaults];
  pushIdleUnderlying(allSurfVaults, ASSETS, tokensAndOwners);

  await api.sumTokens({ tokensAndOwners });
}

async function tvlV4(api) {
  const fromBlock = V4_FROM_BLOCKS[api.chain];
  const toBlock = api.block ?? await api.getBlock();
  if (!fromBlock || toBlock < fromBlock) return;

  const assets = await api.call({ abi: ABI.getAllowedAssets, target: V4_REGISTRY });
  if (!assets || assets.length === 0) return;

  const userVaults = await discoverVaults(api, V4_FACTORY, ABI.v4VaultDeployed, fromBlock);
  if (userVaults.length === 0) return;

  const tokensAndOwners = [];
  await pushMorphoShares(api, userVaults, assets, tokensAndOwners);
  pushIdleUnderlying(userVaults, assets, tokensAndOwners);
  await api.sumTokens({ tokensAndOwners });
}

async function tvlBase(api) {
  await tvl(api);
  await tvlV4(api);
}

async function staking(api) {
  // SURF staking contract
  const totalStaked = await api.call({ abi: ABI.totalStaked, target: SURF_STAKING });
  api.add(SURF_TOKEN, totalStaked);

  // CreatorBid SURF subscriptions (SURF locked in the token contract)
  const subscribed = await api.call({
    abi: ABI.balanceOf,
    target: SURF_TOKEN,
    params: [SURF_TOKEN],
  });
  api.add(SURF_TOKEN, subscribed);
}

module.exports = {
  methodology: "TVL counts Morpho vault deposits across V2/V3 Surf Liquid vaults (Base) and V4 user vaults (Base, Ethereum, Arbitrum, Polygon), plus idle underlying held at each surf vault. Staking includes SURF staked and SURF subscriptions.",
  doublecounted: true,
  hallmarks: [
    ["2025-11-30", "V3 factory launched"],
    ["2026-03-26", "V4 launched on Ethereum, Base, Arbitrum, Polygon"],
  ],
  base: {
    tvl: tvlBase,
    staking,
  },
  ethereum: { tvl: tvlV4 },
  arbitrum: { tvl: tvlV4 },
  polygon: { tvl: tvlV4 },
};
