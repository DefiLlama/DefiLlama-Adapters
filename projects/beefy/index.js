const { getConfig } = require('../helper/cache');
const sdk = require('@defillama/sdk')
const utils = require('../helper/utils');
const { sumTokens2 } = require('../helper/unwrapLPs');


const distressedAssets = ['aleth'];

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


module.exports = {
  misrepresentedTokens: true,

  methodology: 'Provides the current and live total value locked of each Beefy vault, which is the sum of the current market capitalisation of all of the assets currently held by the relevant vault, denominated in $USD. Fetches vault addresses from Beefy API, then queries actual onchain balances of underlying tokens in each vault contract.',
};

Object.keys(chains).forEach(chain =>
  module.exports[chain] = { tvl: (api) => tvl(api, false), staking: (api) => tvl(api, true) }
)
