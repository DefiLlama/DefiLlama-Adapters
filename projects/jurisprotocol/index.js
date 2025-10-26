const { get } = require('../helper/http');
const abi = require('./abi.json');
const { queryContractSmart } = require('../helper/chain/cosmos');

const LCD = process.env.TERRA_LCD || 'https://terra-classic-lcd.publicnode.com';
const { contracts, tokens } = abi;

// Helper: base64 encode JSON for smart queries
function b64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

// DEBUG: Test queryContractSmart availability
console.log('[DEBUG] queryContractSmart imported:', typeof queryContractSmart);
console.log('[DEBUG] abi.json contracts keys:', Object.keys(contracts));

async function smartQuery(contract, msgObj) {
  const url = `${LCD}/cosmwasm/wasm/v1/contract/${contract}/smart/${b64(msgObj)}`;
  const res = await get(url);
  console.log(url, 'smartQuery');
  return res.data || res.result || res;
}

async function bankBalances(address) {
  const url = `${LCD}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
  console.log(url, 'bankBalances');
  const res = await get(url);
  return res.balances || [];
}

async function cw20Balance(token, address) {
  const r = await smartQuery(token, { balance: { address } });
  return BigInt((r && r.balance) || (r?.data?.balance) || '0');
}

function nativeBalance(balances, denom) {
  const row = balances.find((x) => x.denom === denom);
  return row ? BigInt(row.amount) : BigInt(0);
}

// Cache for token metadata to avoid repeated queries
const metadataCache = {};

// ENHANCED: Fetch token metadata - tries queryContractSmart FIRST, then 4 fallbacks
async function fetchTokenMetadata(tokenAddress) {
  try {
    // Check cache first
    if (metadataCache[tokenAddress]) {
      console.log(`[DEBUG] Metadata cache HIT for ${tokenAddress}:`, metadataCache[tokenAddress]);
      return metadataCache[tokenAddress];
    }

    console.log(`[DEBUG] Fetching metadata for token: ${tokenAddress}`);

    // PRIMARY: Try using queryContractSmart FIRST (DefiLlama SDK method)
    if (typeof queryContractSmart === 'function') {
      try {
        const metadata = await queryContractSmart({
          contract: tokenAddress,
          chain: 'terra',
          data: { token_info: {} }
        });
        
        if (metadata && Object.keys(metadata).length > 0) {
          console.log(`[DEBUG] ✅ queryContractSmart SUCCESS for ${tokenAddress}:`, metadata);
          metadataCache[tokenAddress] = metadata;
          return metadata;
        } else {
          console.log(`[DEBUG] ⚠️  queryContractSmart returned empty/null for ${tokenAddress}, trying fallbacks...`);
        }
      } catch (err) {
        console.log(`[DEBUG] ⚠️  queryContractSmart ERROR for ${tokenAddress}:`, err.message, '- trying fallbacks...');
      }
    } else {
      console.log(`[DEBUG] ⚠️  queryContractSmart not available, using fallbacks`);
    }

    // FALLBACK 1: Try manual smartQuery with token_info
    try {
      console.log(`[DEBUG] FALLBACK 1: Attempting smartQuery (token_info) for ${tokenAddress}`);
      const metadata = await smartQuery(tokenAddress, { token_info: {} });
      
      if (metadata && Object.keys(metadata).length > 0) {
        console.log(`[DEBUG] ✅ FALLBACK 1 smartQuery SUCCESS for ${tokenAddress}:`, metadata);
        metadataCache[tokenAddress] = metadata;
        return metadata;
      } else {
        console.log(`[DEBUG] ⚠️  FALLBACK 1 returned empty, trying FALLBACK 2...`);
      }
    } catch (err) {
      console.log(`[DEBUG] ⚠️  FALLBACK 1 ERROR for ${tokenAddress}:`, err.message, '- trying FALLBACK 2...');
    }

    // FALLBACK 2: Try different query method - direct contract query
    try {
      console.log(`[DEBUG] FALLBACK 2: Attempting direct contract query for ${tokenAddress}`);
      const url = `${LCD}/cosmwasm/wasm/v1/contract/${tokenAddress}/smart/${b64({ token_info: {} })}`;
      const res = await get(url);
      const metadata = res.data || res.result || res;
      
      if (metadata && Object.keys(metadata).length > 0) {
        console.log(`[DEBUG] ✅ FALLBACK 2 direct query SUCCESS for ${tokenAddress}:`, metadata);
        metadataCache[tokenAddress] = metadata;
        return metadata;
      } else {
        console.log(`[DEBUG] ⚠️  FALLBACK 2 returned empty, trying FALLBACK 3...`);
      }
    } catch (err) {
      console.log(`[DEBUG] ⚠️  FALLBACK 2 ERROR for ${tokenAddress}:`, err.message, '- trying FALLBACK 3...');
    }

    // FALLBACK 3: Try from abi.json tokens config
    try {
      console.log(`[DEBUG] FALLBACK 3: Checking abi.json tokens config for ${tokenAddress}`);
      for (const [key, tokenInfo] of Object.entries(tokens)) {
        if (tokenInfo.address === tokenAddress) {
          const metadata = {
            name: tokenInfo.name || 'Unknown',
            symbol: tokenInfo.symbol || 'Unknown',
            decimals: tokenInfo.decimals || 6,
            total_supply: tokenInfo.total_supply || '0'
          };
          console.log(`[DEBUG] ✅ FALLBACK 3 found in abi.json for ${tokenAddress}:`, metadata);
          metadataCache[tokenAddress] = metadata;
          return metadata;
        }
      }
      console.log(`[DEBUG] ⚠️  FALLBACK 3 not found in abi.json config, trying FALLBACK 4...`);
    } catch (err) {
      console.log(`[DEBUG] ⚠️  FALLBACK 3 ERROR for ${tokenAddress}:`, err.message, '- trying FALLBACK 4...');
    }

    // FALLBACK 4: Return defaults with config decimals
    try {
      console.log(`[DEBUG] FALLBACK 4: Using default values for ${tokenAddress}`);
      for (const [key, tokenInfo] of Object.entries(tokens)) {
        if (tokenInfo.address === tokenAddress) {
          const metadata = {
            name: 'Unknown Token',
            symbol: 'UNKNOWN',
            decimals: tokenInfo.decimals || 6
          };
          console.log(`[DEBUG] ✅ FALLBACK 4 using config decimals for ${tokenAddress}:`, metadata);
          metadataCache[tokenAddress] = metadata;
          return metadata;
        }
      }
      // Last resort - return with default 6 decimals
      const metadata = {
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        decimals: 6
      };
      console.log(`[DEBUG] ✅ FALLBACK 4 using hardcoded defaults for ${tokenAddress}:`, metadata);
      metadataCache[tokenAddress] = metadata;
      return metadata;
    } catch (err) {
      console.log(`[DEBUG] ❌ FALLBACK 4 ERROR for ${tokenAddress}:`, err.message);
      return null;
    }
  } catch (err) {
    console.log(`[DEBUG] ❌ CRITICAL ERROR fetching metadata for ${tokenAddress}:`, err.message);
    return null;
  }
}

// Core TVL logic using abi.json layout - NOW RECEIVES api PARAMETER
async function fetchBalances(moduleName, api) {
  const contractList = Array.isArray(contracts[moduleName])
    ? contracts[moduleName].filter((addr) => addr && addr.trim() !== '')
    : [];

  if (!contractList.length) {
    console.log(`[Juris] No contracts found for module: ${moduleName}`);
    return;
  }

  for (const owner of contractList) {
    for (const [tokenKey, tokenInfo] of Object.entries(tokens)) {
      if (tokenInfo.type === 'cw20') {
        // Fetch metadata - tries queryContractSmart first, then 4 fallbacks
        const metadata = await fetchTokenMetadata(tokenInfo.address);

        const bal = await cw20Balance(tokenInfo.address, owner);
        const decimals = metadata?.decimals || tokenInfo.decimals || 6;
        const displayBalance = Number(bal) / Math.pow(10, decimals);

        // DIAGNOSTIC: Log what we're sending to api.add()
        const addressFormats = [
          `terra:${tokenInfo.address}`,
          tokenInfo.address,
          `lunc:${tokenInfo.address}`,
          tokenInfo.address.replace('terra', 'lunc')
        ];

        console.log(`[DIAGNOSTIC] Testing address formats for ${tokenInfo.address}:`);
        addressFormats.forEach((fmt, idx) => {
          console.log(`  Format ${idx + 1}: ${fmt}`);
        });

        // Use primary format but log details
        const primaryAddress = `terra:${tokenInfo.address}`;
        console.log(`[API.ADD] Calling api.add with: '${primaryAddress}', ${bal.toString()}`);
        console.log(`[API.ADD] Token decimals: ${decimals}, Display: ${displayBalance}`);

        // CORRECT: Use api.add() - DefiLlama processes it immediately
        api.add(primaryAddress, bal);

        console.log(
          `[Juris] Module [${moduleName}] Contract [${owner}] CW20 [${tokenInfo.address}]\n` +
          `  Metadata: Name=${metadata?.name || '?'}, Symbol=${metadata?.symbol || '?'}, Decimals=${decimals}\n` +
          `  Raw Balance: ${bal.toString()}\n` +
          `  Display Balance: ${displayBalance}`
        );
      }

      if (tokenInfo.type === 'native') {
        const allBank = await bankBalances(owner);
        const bal = nativeBalance(allBank, tokenInfo.address);
        
        // CORRECT: Use api.add() for native tokens
        if (bal > 0n) {
          console.log(`[API.ADD] Calling api.add with: '${tokenInfo.address}', ${bal.toString()}`);
          api.add(tokenInfo.address, bal);
        }
        
        const decimals = tokenInfo.decimals || 6;
        console.log(
          `[Juris] Module [${moduleName}] Contract [${owner}] Native [${tokenInfo.address}] Balance: ${
            Number(bal) / Math.pow(10, decimals)
          }`
        );
      }
    }
  }
}

// Smart & Dynamic module exports using terraExport
// IMPORTANT: Each function must receive 'api' parameter and pass it to fetchBalances
const terraExport = {};

Object.keys(contracts).forEach((contractKey) => {
  if ((contracts[contractKey] || []).some((addr) => addr && addr.trim() !== '')) {
    // Wrap fetchBalances to receive and pass api
    terraExport[contractKey] = async (api) => await fetchBalances(contractKey, api);
  }
});

console.log('[DEBUG] terraExport keys BEFORE tvl function:', Object.keys(terraExport));

if (Object.keys(terraExport).length > 0) {
  terraExport.tvl = async (api) => {
    // Aggregate TVL by calling all module functions with api
    for (const key of Object.keys(terraExport).filter((k) => k !== 'tvl')) {
      console.log(`[TVL] Processing module: ${key}`);
      await terraExport[key](api);
    }
  };
}

console.log('[DEBUG] terraExport keys AFTER tvl function:', Object.keys(terraExport));
console.log('[DEBUG] Categories that DefiLlama will show:');
Object.keys(terraExport).forEach((key) => {
  if (key === 'tvl') {
    console.log(`  - tvl (aggregate of all modules)`);
  } else {
    console.log(`  - terra-${key} (from module: ${key})`);
  }
});

module.exports = {
  methodology: `${abi.protocol.description}. TVL fetched directly from on-chain LCD for each active contract and token in abi.json.`,
  timetravel: false,
  terra: terraExport,
};
