const { PublicKey } = require('@solana/web3.js');
const sui = require('../helper/chain/sui');
const { getMultipleAccounts } = require('../helper/solana');
const { callSoroban } = require('../helper/chain/stellar');
const { getConfig } = require('../helper/cache');

const vaultsApiEndpoint = "https://api.augustdigital.io/api/v1/tokenized_vault?status=active&load_subaccounts=false&load_snapshots=false";
// Chain ID to chain name mapping
const chainIdToName = {
  1: 'ethereum',
  56: 'bsc',
  8453: 'base',
  43114: 'avax',
  999: 'hyperliquid',
  143: 'monad',
  9745: 'plasma',
  14: 'flare',
  31612: "mezo",
  57073: "ink",
  25363: "fluent",
  4114: "citrea"
};

// Solana vaults are not in chainIdToName: they are Anchor accounts, not EVM
// contracts, and are read via the program below rather than erc4626Sum.
const SOLANA_CHAIN_ID = -1;
const SOLANA_VAULT_PROGRAM = 'up12bytoZBmwofqsySf2uqKQ7zpfeKiAWwfvqzJjtRt';

// VaultState layout: 8-byte Anchor discriminator, 5 pubkeys, u32 withdrawal_fee,
// then local_aum and deployed_aum. total assets = local + deployed, mirroring
// ERC4626 totalAssets (idle balance plus capital deployed to strategies).
const VAULT_STATE_DISCRIMINATOR = Buffer.from([228, 196, 82, 165, 98, 210, 235, 152]);
const DEPOSIT_MINT_OFFSET = 8 + 32 * 3;
const LOCAL_AUM_OFFSET = 8 + 32 * 5 + 4;
const DEPLOYED_AUM_OFFSET = LOCAL_AUM_OFFSET + 8;
const MIN_VAULT_STATE_LEN = DEPLOYED_AUM_OFFSET + 8;

// USDx has no entry in DefiLlama's price feed, so the Axis Origin pre-deposit
// vault (~$67M) is currently valued at zero. It is a $1-denominated accounting
// unit, so map it onto USDT and rescale 18 -> 6 decimals.
const USDX = '0xa1fa7777974312f7d801a8880714a218f76233f8';
const USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const USDX_DECIMAL_SCALE = 10n ** 12n;

const suiVaultsToInclude = [
  "0x94c2826b24e44f710c5f80e3ed7ce898258d7008e3a643c894d90d276924d4b9",
  "0xfaf4d0ec9b76147c926c0c8b2aba39ea21ec991500c1e3e53b60d447b0e5f655",
  "0x323578c2b24683ca845c68c1e2097697d65e235826a9dc931abce3b4b1e43642",
  "0x1fdbd27ba90a7a5385185e3e0b76477202f2cadb0e4343163288c5625e7c5505",
  "0x30844745c8197fdaf9fe06c4ffeb73fe05c092ce0040674a3758dbfcb032a1f4",
];

// Stellar (Soroban) vaults — August/Gami tokenized vaults (OZ FungibleVault).
// total_assets() = idle balance + strategy balances + deployed capital; and
// query_asset() returns the underlying token's Soroban contract address, which
// DefiLlama prices directly (the USDC/XLM SACs are already in coreAssets).
const stellarVaultsToInclude = [
  "CCL3WITWFFXIHV2I52ECV5DPIEOFSTU3PBPR53ILPLF2IP5KHECXRUTY", // Gami earnUSDC
  "CC6TRAPQD3NK7THUKWPV5SL2JHKQGNXZVB6S6MVYFSLRWAKEFUWZKZ7J", // Gami earnXLM
];

// V1 vault types (ERC4626 compatible)
const v1VaultTypes = ['tokenizedVault', 'lendingPool'];
// V2 vault types (multiAssetVault)
const v2VaultTypes = ['multiAssetVault'];

// Fetch vaults from API and organize by chain and type
async function getVaultsConfig() {
  const vaults = await getConfig('upshift/vaults', vaultsApiEndpoint);
  
  const config = {};
  const v2Vaults = {};
  
  for (const vault of vaults) {
    // Filter out vaults where is_visible is false
    if (vault.status !== "active") continue;
    
    const chainName = chainIdToName[vault.chain];
    if (!chainName) continue; // Skip unsupported chains
    
    const address = vault.address;
    const internalType = vault.internal_type;
    
    // Categorize as v1 or v2 based on internal_type
    if (v1VaultTypes.includes(internalType)) {
      if (!config[chainName]) config[chainName] = [];
      config[chainName].push(address);
    } else if (v2VaultTypes.includes(internalType)) {
      if (!v2Vaults[chainName]) v2Vaults[chainName] = [];
      v2Vaults[chainName].push(address);
    }
  }
  
  return { config, v2Vaults };
}



// Custom function to handle v2 vaults with getTotalAssets
async function sumV2Vaults(api, vaults) {
  const assets = await api.multiCall({ abi: "address:asset", calls: vaults })
  const totalAssets = await api.multiCall({ abi: "uint256:getTotalAssets", calls: vaults })

  for (let i = 0; i < assets.length; i++) {
    if (assets[i].toLowerCase() !== USDX) continue
    assets[i] = USDT
    totalAssets[i] = (BigInt(totalAssets[i]) / USDX_DECIMAL_SCALE).toString()
  }

  api.addTokens(assets, totalAssets)
}

// Solana vaults expose their balances through the VaultState account rather than
// an ERC4626 interface, so they are decoded directly instead of via multiCall.
const solanaVaultsTvl = async (api) => {
  const vaults = await getConfig('upshift/vaults', vaultsApiEndpoint);
  const addresses = vaults
    .filter(v => v.status === 'active' && v.chain === SOLANA_CHAIN_ID)
    .map(v => v.address);
  if (!addresses.length) return;

  const accounts = await getMultipleAccounts(addresses);
  for (const account of accounts) {
    if (!account?.data) continue;
    const data = account.data;
    if (!VAULT_STATE_DISCRIMINATOR.equals(data.subarray(0, 8))) continue;
    if (account.owner?.toString() !== SOLANA_VAULT_PROGRAM) continue;
    // A truncated account would make readBigUInt64LE throw and take the whole
    // chain's TVL to zero, so skip it rather than trusting the discriminator alone.
    if (data.length < MIN_VAULT_STATE_LEN) continue;

    const mint = new PublicKey(data.subarray(DEPOSIT_MINT_OFFSET, DEPOSIT_MINT_OFFSET + 32)).toString();
    const total = data.readBigUInt64LE(LOCAL_AUM_OFFSET) + data.readBigUInt64LE(DEPLOYED_AUM_OFFSET);
    if (total > 0n) api.add(mint, total.toString());
  }
}

const suiVaultsTvl = async (api) => {
  const vaultObjects = await sui.getObjects(suiVaultsToInclude);
  for (const vault of vaultObjects) {
    if (!vault) continue;
    const depositCoinType = vault.type.split('<')[1].split(',')[0].trim();
    const balance = vault.fields?.balance;
    if (balance) api.add(depositCoinType, balance);
  }
}

const stellarVaultsTvl = async (api) => {
  for (const vault of stellarVaultsToInclude) {
    const asset = await callSoroban(vault, 'query_asset')
    const totalAssets = await callSoroban(vault, 'total_assets')
    api.add(asset, totalAssets.toString())
  }
}

// Create a TVL function factory that fetches vault config
function createTvlFunction(chainName) {
  return async (api) => {
    const vaultsConfig = await getVaultsConfig();
    if (!vaultsConfig) return api.getBalances();
    
    const { config = {}, v2Vaults = {} } = vaultsConfig;
    
    // Handle ERC4626 vaults (v1) if they exist for this chain
    if (config[chainName]) {
      await api.erc4626Sum({ calls: config[chainName], isOG4626: true })
    }
    
    // Handle v2 vaults if they exist for this chain
    if (v2Vaults[chainName]) {
      await sumV2Vaults(api, v2Vaults[chainName])
    }
    
    return api.getBalances()
  }
}

// Get all supported chain names from the mapping
const supportedChains = Object.values(chainIdToName);

module.exports = {
  doublecounted: true,
  // Stellar/Sui paths read current on-chain state (Soroban simulateTransaction
  // has no historical mode), so disable time-travel backfill for the adapter.
  timetravel: false,
  methodology: "TVL is the sum of tokens deposited in erc4626 vaults",
}

// Initialize all supported chains (config will be fetched lazily when TVL is called)
supportedChains.forEach(chain => {
  module.exports[chain] = {
    tvl: createTvlFunction(chain)
  }
});

module.exports.sui = {
  tvl: suiVaultsTvl,
}

module.exports.stellar = {
  tvl: stellarVaultsTvl,
}

module.exports.solana = {
  tvl: solanaVaultsTvl,
}
