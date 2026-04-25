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

// V4 — UserVaultFactory + VaultRegistry (same addresses on all chains via CREATE2)
const V4_FACTORY = "0x8fa50DeA8DB10987D7d22ac092001c3613C18779";
const V4_REGISTRY = "0x98A0DeF9C959Ec934Df02141291303819369f271";

// fromBlock per chain — safely before March 26, 2026 V4 deployment
const V4_FROM_BLOCKS = {
  base: 43800000,
  ethereum: 22200000,
  arbitrum: 445000000,
  polygon: 71000000,
};

async function tvl(api) {
  // --- Discover vault addresses ---

  // V2 vaults from factory
  const totalV2 = await api.call({ abi: "uint256:getTotalVaults", target: V2_FACTORY });
  const v2Infos = await api.multiCall({
    abi: "function getVaultInfo(uint256) view returns (address, address, address, uint256, bytes32, uint256)",
    calls: [...Array(Number(totalV2)).keys()].map((i) => ({ target: V2_FACTORY, params: [i] })),
  });
  const v2Vaults = v2Infos.map((info) => info[0]).filter((a) => a && a !== ZERO_ADDR);

  // V3 vaults from factory events
  const currentBlock = api.block || await api.getBlock();
  const v3Logs = await api.getLogs({
    target: V3_FACTORY,
    eventAbi: "event VaultDeployed(address indexed vaultAddress, address indexed owner, address indexed pool, bytes32 marketId, uint256 chainId)",
    onlyArgs: true,
    fromBlock: 38856207,
    toBlock: currentBlock,
  });
  const v3Vaults = v3Logs.map((l) => l.vaultAddress);

  // --- Build (surfVault, morphoVault, asset) allocations ---

  const allocations = []; // { surfVault, morphoVault, asset }

  // V2: currentVault() → USDC only
  const v2MorphoVaults = await api.multiCall({
    abi: "address:currentVault",
    calls: v2Vaults.map((target) => ({ target })),
  });
  for (let i = 0; i < v2Vaults.length; i++) {
    if (v2MorphoVaults[i] && v2MorphoVaults[i] !== ZERO_ADDR) {
      allocations.push({ surfVault: v2Vaults[i], morphoVault: v2MorphoVaults[i], asset: USDC });
    }
  }

  // V3: assetToVault(asset) for each asset
  for (const asset of ASSETS) {
    if (v3Vaults.length === 0) continue;
    const morphoVaults = await api.multiCall({
      abi: "function assetToVault(address) view returns (address)",
      calls: v3Vaults.map((vault) => ({ target: vault, params: [asset] })),
    });
    for (let i = 0; i < v3Vaults.length; i++) {
      if (morphoVaults[i] && morphoVaults[i] !== ZERO_ADDR) {
        allocations.push({ surfVault: v3Vaults[i], morphoVault: morphoVaults[i], asset });
      }
    }
  }

  // --- Unwrap Morpho ERC-4626 shares to underlying tokens ---
  // Manually compute underlying value so DefiLlama prices USDC/WETH/cbBTC directly,
  // avoiding reliance on pricing for custom Morpho vault tokens.

  const uniqueMorphoVaults = [...new Set(allocations.map((a) => a.morphoVault))];

  const [allTotalAssets, allTotalSupply] = await Promise.all([
    api.multiCall({ abi: "uint256:totalAssets", calls: uniqueMorphoVaults.map((t) => ({ target: t })) }),
    api.multiCall({ abi: "uint256:totalSupply", calls: uniqueMorphoVaults.map((t) => ({ target: t })) }),
  ]);

  const morphoData = {};
  for (let i = 0; i < uniqueMorphoVaults.length; i++) {
    morphoData[uniqueMorphoVaults[i]] = {
      totalAssets: BigInt(allTotalAssets[i] || 0),
      totalSupply: BigInt(allTotalSupply[i] || 0),
    };
  }

  const allShares = await api.multiCall({
    abi: "function balanceOf(address) view returns (uint256)",
    calls: allocations.map((a) => ({ target: a.morphoVault, params: [a.surfVault] })),
  });

  for (let i = 0; i < allocations.length; i++) {
    const { morphoVault, asset } = allocations[i];
    const shares = BigInt(allShares[i] || 0);
    if (shares === 0n) continue;
    const { totalAssets, totalSupply } = morphoData[morphoVault];
    if (totalSupply === 0n) continue;
    const underlying = (shares * totalAssets) / totalSupply;
    api.add(asset, underlying);
  }
}

async function tvlV4(api) {
  const fromBlock = V4_FROM_BLOCKS[api.chain];
  if (!fromBlock) return;

  // Query allowed assets from registry — avoids hardcoding per-chain token addresses
  const assets = await api.call({
    abi: "function getAllowedAssets() view returns (address[])",
    target: V4_REGISTRY,
  });
  if (!assets || assets.length === 0) return;

  // Enumerate all personal user vaults deployed by the factory
  const currentBlock = api.block || await api.getBlock();
  const vaultLogs = await api.getLogs({
    target: V4_FACTORY,
    eventAbi: "event VaultDeployed(address indexed vaultAddress, address indexed owner, bytes32 salt)",
    onlyArgs: true,
    fromBlock,
    toBlock: currentBlock,
    cacheInCloud: true,
  });
  const userVaults = vaultLogs.map((l) => l.vaultAddress);
  if (userVaults.length === 0) return;

  // For each asset, sum underlying value across all user vaults.
  // getAssetVaultAssets() calls convertToAssets(shares) on the Morpho vault —
  // always returns exact underlying regardless of which Morpho vault holds the funds.
  for (const asset of assets) {
    const amounts = await api.multiCall({
      abi: "function getAssetVaultAssets(address) view returns (uint256)",
      calls: userVaults.map((vault) => ({ target: vault, params: [asset] })),
    });
    amounts.forEach((amount) => {
      if (amount && BigInt(amount) > 0n) api.add(asset, amount);
    });
  }
}

async function tvlBase(api) {
  await tvl(api);
  await tvlV4(api);
}

async function staking(api) {
  // SURF staking contract
  const totalStaked = await api.call({ abi: "uint256:totalStaked", target: SURF_STAKING });
  api.add(SURF_TOKEN, totalStaked);

  // CreatorBid SURF subscriptions (SURF locked in the token contract)
  const subscribed = await api.call({
    abi: "function balanceOf(address) view returns (uint256)",
    target: SURF_TOKEN,
    params: [SURF_TOKEN],
  });
  api.add(SURF_TOKEN, subscribed);
}

module.exports = {
  methodology: "TVL counts Morpho vault deposits across V2/V3 Surf Liquid vaults (Base) and V4 user vaults (Base, Ethereum, Arbitrum, Polygon). Staking includes SURF staked and SURF subscriptions.",
  doublecounted: true,
  hallmarks: [
    ["2025-11-30", "V3 factory launched"],
    ["2026-03-26", "V4 launched on Ethereum, Base, Arbitrum, Polygon"],
  ],
  base: {
    tvl: tvlBase,
    staking,
  },
  ethereum: {
    tvl: tvlV4,
  },
  arbitrum: {
    tvl: tvlV4,
  },
  polygon: {
    tvl: tvlV4,
  },
};
