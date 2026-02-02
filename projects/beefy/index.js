const { getConfig } = require('../helper/cache');
const sdk = require('@defillama/sdk')
const utils = require('../helper/utils');
const { sumTokens2 } = require('../helper/unwrapLPs');


const distressedAssets = ['aleth'];
/**
 * This vaults were affected by Stream's xUSD incident on 2025 and the underlying platform is returning 
 * an innacurate (higher) balance that isn't recoverable by users. To avoid overstating the TVL, we hardcode the balances
 * at the moment the vaults were paused at Beefy:
 * avax block: 73541735, arbitrum block: 409563489
 */
const balanceOverrides = {
  avax: {
    '0x79a8d2cbdcb651013dae6be25a3813ca70f35732': '492153165795',      // silov2-avalanche-ausd-valamore (~492k, 6 decimals)
    '0x7e74446ee441a8da46f61f9ada7f8368d26e0eea': '2251698412379',     // silov2-avalanche-usdt-valamore (~2.25M, 6 decimals)
    '0xd1fec8530a8e824f051d80ce17d238e96a75bcb2': '3049903089584',     // silov2-avalanche-usdc-mev (~3M, 6 decimals)
  },
  arbitrum: {
    '0x0c0846c5d8194bc327669763ac6af9b788edb409': '11591864596129',    // silov2-arbitrum-usdc-valamore (~11.6M, 6 decimals)
  },
};

// ABI for Beefy vaults
const vaultABI = {
  balance: 'function balance() view returns (uint256)',
  want: 'function want() view returns (address)',
  token: 'address:token',
  underlying: 'address:underlying',
};

// Supported chains 
const chains = {
  ethereum: 1,
  optimism: 10,
  cronos: 25,
  rsk: 30,
  bsc: 56,
  xdai: 100,
  fuse: 122,
  heco: 128,
  polygon: 137,
  monad: 143,
  sonic: 146,
  manta: 169,
  fantom: 250,
  fraxtal: 252,
  era: 324,
  hyperliquid: 999,
  metis: 1088,
  polygon_zkevm: 1101,
  lisk: 1135,
  moonbeam: 1284,
  moonriver: 1285,
  sei: 1329,
  kava: 2222,
  mantle: 5000,
  saga: 5464,
  canto: 7700,
  base: 8453,
  plasma: 9745,
  mode: 34443,
  arbitrum: 42161,
  celo: 42220,
  oasis: 42262,
  avax: 43114,
  linea: 59144,
  berachain: 80094,
  real: 111188,
  scroll: 534352,
  aurora: 1313161554,
  harmony: 1666600000
};

// Beefy chain name to our chain name mapping
// This maps Beefy's chain names to our standardized names
const beefyChainNameMapping = {
  'ethereum': 'ethereum',
  'optimism': 'optimism',
  'cronos': 'cronos',
  'rsk': 'rsk',
  'bsc': 'bsc',
  'gnosis': 'xdai',
  'xdai': 'xdai',
  'fuse': 'fuse',
  'heco': 'heco',
  'polygon': 'polygon',
  'monad': 'monad',
  'sonic': 'sonic',
  'manta': 'manta',
  'fantom': 'fantom',
  'fraxtal': 'fraxtal',
  'zksync': 'era',
  'era': 'era',
  'hyperliquid': 'hyperliquid',
  'hyperevm': 'hyperliquid',
  'rootstock': 'rsk',
  'metis': 'metis',
  'polygonzkevm': 'polygon_zkevm',
  'polygon_zkevm': 'polygon_zkevm',
  'zkevm': 'polygon_zkevm',
  'lisk': 'lisk',
  'moonbeam': 'moonbeam',
  'moonriver': 'moonriver',
  'sei': 'sei',
  'kava': 'kava',
  'mantle': 'mantle',
  'saga': 'saga',
  'canto': 'canto',
  'base': 'base',
  'plasma': 'plasma',
  'mode': 'mode',
  'arbitrum': 'arbitrum',
  'celo': 'celo',
  'emerald': 'oasis',
  'oasis': 'oasis',
  'avalanche': 'avax',
  'avax': 'avax',
  'linea': 'linea',
  'berachain': 'berachain',
  'real': 'real',
  'scroll': 'scroll',
  'aurora': 'aurora',
  'one': 'harmony',
  'harmony': 'harmony',
};

async function fetchVaultData() {
  const vaultsResponse = await utils.fetchURL('https://api.beefy.finance/vaults');
  const vaults = vaultsResponse.data;

  // sdk.log('Raw API response sample:', JSON.stringify(vaults[0], null, 2));

  if (!Array.isArray(vaults) || vaults.length === 0) {
    throw new Error('Invalid or empty vaults response');
  }

  sdk.log(`Fetched ${vaults.length} vaults from Beefy API`);

  const vaultsByChain = {};
  let mappedVaults = 0;
  let unmappedChains = new Set();

  vaults.forEach(vault => {
    // Try to get chain from vault object
    const beefyChainName = vault.chain;

    if (!beefyChainName) {
      sdk.log('Vault missing chain field:', vault.id);
      return;
    }

    // Map Beefy's chain name to our chain name
    const ourChainName = beefyChainNameMapping[beefyChainName.toLowerCase()];

    if (!ourChainName) {
      // Track unmapped chains for debugging
      unmappedChains.add(beefyChainName);
      return;
    }

    if (!vaultsByChain[ourChainName]) {
      vaultsByChain[ourChainName] = [];
    }

    const isDistressed = distressedAssets.some(asset =>
      vault.id.toLowerCase().includes(asset.toLowerCase())
    );

    if (!isDistressed && vault.earnContractAddress) {
      vaultsByChain[ourChainName].push({
        id: vault.id,
        address: vault.earnContractAddress,
        token: vault.tokenAddress,
        isBIFI: vault.id.toLowerCase().includes('bifi'),
        status: vault.status,
        chain: ourChainName
      });
      mappedVaults++;
    }
  });

  // sdk.log(`Mapped ${mappedVaults} vaults across ${Object.keys(vaultsByChain).length} chains`);
  if (unmappedChains.size > 0) {
    sdk.log(`Unmapped Beefy chains:`, Array.from(unmappedChains).join(', '));
  }

  // Log vault counts per chain
  // Object.entries(vaultsByChain).forEach(([chain, vaults]) => {
  //   sdk.log(`${chain}: ${vaults.length} vaults`);
  // });

  return vaultsByChain
}

async function tvl(api, isStaking = false) {
  const chain = api.chain;
  // sdk.log(`\n=== Computing TVL for ${chain} ===`);

  // Fetch vault data from API - let errors propagate
  const vaultsByChain = await getConfig('beefy-vaults', undefined, {
    fetcher: fetchVaultData,
  })
  const vaults = vaultsByChain[chain] || [];

  // Filter out BIFI staking vaults and inactive vaults
  let activeVaults = vaults.filter(v => v.isBIFI);

  if (!isStaking)
    activeVaults = vaults.filter(v => !v.isBIFI);

  // sdk.log(`Active non-BIFI vaults: ${activeVaults.length}`);

  const vaultAddresses = activeVaults.map(v => v.address);

  let tokens = await api.multiCall({ abi: vaultABI.want, calls: vaultAddresses, permitFailure: true, });
  const filteredVaults = [];
  const wants = [];

  tokens.forEach((token, i) => {
    if (!token && activeVaults[i].token)
      tokens[i] = activeVaults[i].token;

    if (tokens[i]) {
      wants.push(tokens[i]);
      filteredVaults.push(vaultAddresses[i]);
    }
  })

  const tokenSymbols = await api.multiCall({ abi: 'string:symbol', calls: wants, permitFailure: true, });
  const wantTokens = await api.multiCall({ abi: 'function wants() view returns (address token0, address token1)', calls: wants, permitFailure: true, });
  const wantBalances = await api.multiCall({ abi: 'function balances() view returns  (uint256 balance0, uint256 balance1)', calls: wants, permitFailure: true, });

  const balances = await api.multiCall({ abi: vaultABI.balance, calls: filteredVaults, permitFailure: true, });
  applyBalanceOverrides(chain, filteredVaults, balances);

  wants.forEach((token, i) => {
    const balance = balances[i]
    const tokenSymbol = tokenSymbols[i] ?? ''
    const multiTokens = wantTokens[i]
    const multiBalances = wantBalances[i]

    // check if this is a token for a concentrated LP (uni v3 style)
    const isConcLP = tokenSymbol.startsWith('cow') && tokenSymbol.includes('-') && multiTokens && multiBalances

    if (isConcLP) {
      api.add(multiTokens.token0, multiBalances.balance0);
      api.add(multiTokens.token1, multiBalances.balance1);
    }
    else if (token && balance) api.add(token, balance);
  });

  return sumTokens2({ api, resolveLP: true, resolveIchiVault: true, });
}

/** Mutates the balances array in place, applying hardcoded overrides for affected vaults */
function applyBalanceOverrides(chain, vaultAddresses, balances) {
  const chainOverrides = balanceOverrides[chain] || {};
  balances.forEach((_, i) => {
    const vaultAddress = vaultAddresses[i].toLowerCase();
    if (chainOverrides[vaultAddress] !== undefined) {
      // sdk.log(`Balance override applied for ${vaultAddress}: ${balances[i]} -> ${chainOverrides[vaultAddress]}`);
      balances[i] = chainOverrides[vaultAddress];
    }
  });
}


module.exports = {
  misrepresentedTokens: true,

  methodology: 'Provides the current and live total value locked of each Beefy vault, which is the sum of the current market capitalisation of all of the assets currently held by the relevant vault, denominated in $USD. Fetches vault addresses from Beefy API, then queries actual onchain balances of underlying tokens in each vault contract.',
};

Object.keys(chains).forEach(chain =>
  module.exports[chain] = { tvl: (api) => tvl(api, false), staking: (api) => tvl(api, true) }
)
