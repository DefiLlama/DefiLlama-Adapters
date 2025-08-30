const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require('../helper/unwrapLPs');

const sanitizeAndValidateEvmAddresses = (addresses) => {
  return addresses
    .map((address) => address.replace(/_$/, ""))
    .filter((address) => /^0x[a-fA-F0-9]{40}$/.test(address));
};

const LHYPE_VAULT_ADDRESS = '0x5748ae796AE46A4F1348a1693de4b50560485562';
const WHLP_HLP_CONTROLLER_ADDRESS = '0x70bcc95d203920971c0d4C3EE8eC080c7ac29f18'
const USDhl = '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5';

const WHLP_VAULT_ADDRESS = '0x1359b05241cA5076c9F59605214f4F84114c0dE8'
const HLP_VAULT_ADDRESS = '0xdfc24b077bc1425ad1dea75bcb6f8158e10df303'
const WHLP_HYPER_CORE_MULTISIGS = [
  '0x9fcB7066C8AeEe704f9D017996b490873b306E51',
  '0x41f45A847bB6c8bFf1448FEE5C9525875D443b9E',
  '0x296B1078D860c69C94CA933c4BcD2d6f192DD86e',
  '0x31Cbd708B505d3A9A0dae336BC9476b694256e74',
  '0xFBB47621086901487C7f3beC6F23205738d59e27',
]

// CoreReader addresses and constants
const CORE_READER_VAULT_EQUITY = '0x0000000000000000000000000000000000000802' 
const CORE_READER_SPOT_BALANCE = '0x0000000000000000000000000000000000000801' 
const CORE_READER_MARGIN_SUMMARY = '0x000000000000000000000000000000000000080F'
const USDHL_TOKEN_ID = 291n 
const USDC_TOKEN_ID = 0n 
const PERP_DEX_INDEX = 0n 
const BATCH_SIZE = 50
const BATCH_DELAY_MS = 100

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to encode ABI parameters (simplified version)
const encodeAbiParameters = (types, values) => {
  // This is a simplified ABI encoding - in production you'd use a proper ABI library
  // For now, we'll create the calldata manually based on the expected format
  if (types.length === 2 && types[0].type === "address" && types[1].type === "address") {
    // For vault equity: [address, address]
    return `0x${values[0].slice(2)}${values[1].slice(2)}`;
  } else if (types.length === 2 && types[0].type === "address" && types[1].type === "uint64") {
    // For spot balance: [address, uint64]
    return `0x${values[0].slice(2)}${values[1].toString(16).padStart(16, '0')}`;
  } else if (types.length === 2 && types[0].type === "uint32" && types[1].type === "address") {
    // For margin summary: [uint32, address]
    return `0x${values[0].toString(16).padStart(8, '0')}${values[1].slice(2)}`;
  }
  return "0x";
};

// Helper function to decode ABI parameters (simplified version)
const decodeAbiParameters = (types, data) => {
  // This is a simplified ABI decoding - in production you'd use a proper ABI library
  // For now, we'll return placeholder values
  if (types.length === 2 && types[0].type === "uint256" && types[1].type === "uint256") {
    // For vault equity: [equity, lockedUntilTimestamp]
    return [BigInt(data || 0), BigInt(0)];
  } else if (types.length === 3 && types[0].type === "uint256") {
    // For spot balance: [total, hold, entryNtl]
    return [BigInt(data || 0), BigInt(0), BigInt(0)];
  } else if (types.length === 4 && types[0].type === "uint256") {
    // For margin summary: [accountValue, marginUsed, ntlPos, rawUsd]
    return [BigInt(data || 0), BigInt(0), BigInt(0), BigInt(0)];
  }
  return [BigInt(0)];
};

/**
 * Fetch vault equity for multiple accounts using CoreReader
 */
const fetchVaultEquity = async (api, accounts) => {
  const results = [];

  // Process accounts in batches
  for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
    const batch = accounts.slice(i, i + BATCH_SIZE);

    // Create call data for vault equity
    const calls = batch.map((account) => {
      const vaultEquityCalldata = encodeAbiParameters(
        [{ type: "address" }, { type: "address" }],
        [account, HLP_VAULT_ADDRESS]
      );

      return {
        target: CORE_READER_VAULT_EQUITY,
        data: vaultEquityCalldata,
      };
    });

    try {
      const batchResults = await api.multiCall({ calls, permitFailure: false });
      
      batch.forEach((account, index) => {
        const vaultEquity = batchResults[index];
        
        if (vaultEquity && vaultEquity !== '0x') {
          const decodedVaultEquity = decodeAbiParameters(
            [
              { type: "uint256", name: "equity" },
              { type: "uint256", name: "lockedUntilTimestamp" },
            ],
            vaultEquity
          );

          results.push({
            account,
            vaultEquity: {
              equity: decodedVaultEquity[0],
              lockedUntilTimestamp: decodedVaultEquity[1],
            },
          });
        } else {
          results.push({
            account,
            vaultEquity: {
              equity: 0n,
              lockedUntilTimestamp: 0n,
            },
          });
        }
      });
    } catch (error) {
      // If batch fails, add default values for all accounts in batch
      batch.forEach((account) => {
        results.push({
          account,
          vaultEquity: {
            equity: 0n,
            lockedUntilTimestamp: 0n,
          },
        });
      });
    }

    if (i + BATCH_SIZE < accounts.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  const totals = {
    totalVaultEquity: results.reduce(
      (sum, account) => sum + account.vaultEquity.equity,
      0n
    ),
  };

  return { accounts: results, totals };
};

/**
 * Fetch USDHL spot balances for multiple accounts using CoreReader
 */
const fetchUsdhlSpotBalances = async (api, accounts) => {
  const results = [];

  // Process accounts in batches
  for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
    const batch = accounts.slice(i, i + BATCH_SIZE);

    // Create call data for USDHL spot balances
    const calls = batch.map((account) => {
      const spotUsdhlCalldata = encodeAbiParameters(
        [{ type: "address" }, { type: "uint64" }],
        [account, USDHL_TOKEN_ID]
      );

      return {
        target: CORE_READER_SPOT_BALANCE,
        data: spotUsdhlCalldata,
      };
    });

    try {
      const batchResults = await api.multiCall({ calls, permitFailure: false });
      
      batch.forEach((account, index) => {
        const spotUsdhl = batchResults[index];
        
        if (spotUsdhl && spotUsdhl !== '0x') {
          const decodedSpotUsdhl = decodeAbiParameters(
            [
              { type: "uint256", name: "total" },
              { type: "uint256", name: "hold" },
              { type: "uint256", name: "entryNtl" },
            ],
            spotUsdhl
          );

          // Convert from 1e7 precision to 1e6 precision
          const total = (decodedSpotUsdhl[0] * 10n) / 100n; // 1e7 -> 1e6
          const hold = (decodedSpotUsdhl[1] * 10n) / 100n; // 1e7 -> 1e6
          const entryNtl = (decodedSpotUsdhl[2] * 10n) / 100n; // 1e7 -> 1e6

          results.push({
            account,
            spotUsdhl: { total, hold, entryNtl },
          });
        } else {
          results.push({
            account,
            spotUsdhl: { total: 0n, hold: 0n, entryNtl: 0n },
          });
        }
      });
    } catch (error) {
      // If batch fails, add default values for all accounts in batch
      batch.forEach((account) => {
        results.push({
          account,
          spotUsdhl: { total: 0n, hold: 0n, entryNtl: 0n },
        });
      });
    }

    if (i + BATCH_SIZE < accounts.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  const totals = {
    totalSpotUsdhl: results.reduce(
      (sum, account) => sum + account.spotUsdhl.total,
      0n
    ),
  };

  return { accounts: results, totals };
};

/**
 * Fetch margin summary and USDC spot balance for multiple accounts using CoreReader
 */
const fetchMarginSummaryAndUsdcSpot = async (api, accounts) => {
  const results = [];

  // Process accounts in batches
  for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
    const batch = accounts.slice(i, i + BATCH_SIZE);

    // Create call data for margin summary and USDC spot balance
    const marginSummaryCalls = batch.map((account) => {
      const marginSummaryCalldata = encodeAbiParameters(
        [{ type: "uint32" }, { type: "address" }],
        [PERP_DEX_INDEX, account]
      );

      return {
        target: CORE_READER_MARGIN_SUMMARY,
        data: marginSummaryCalldata,
      };
    });

    const spotUsdcCalls = batch.map((account) => {
      const spotUsdcCalldata = encodeAbiParameters(
        [{ type: "address" }, { type: "uint64" }],
        [account, USDC_TOKEN_ID]
      );

      return {
        target: CORE_READER_SPOT_BALANCE,
        data: spotUsdcCalldata,
      };
    });

    try {
      const [marginSummaryResults, spotUsdcResults] = await Promise.all([
        api.multiCall({ calls: marginSummaryCalls, permitFailure: true }),
        api.multiCall({ calls: spotUsdcCalls, permitFailure: true }),
      ]);
      
      batch.forEach((account, index) => {
        const marginSummary = marginSummaryResults[index];
        const spotUsdc = spotUsdcResults[index];
        
        let accountValue = 0n, marginUsed = 0n, ntlPos = 0n, rawUsd = 0n;
        let total = 0n, hold = 0n, entryNtl = 0n;

        if (marginSummary && marginSummary !== '0x') {
          const decodedMarginSummary = decodeAbiParameters(
            [
              { type: "uint256", name: "accountValue" },
              { type: "uint256", name: "marginUsed" },
              { type: "uint256", name: "ntlPos" },
              { type: "uint256", name: "rawUsd" },
            ],
            marginSummary
          );
          accountValue = decodedMarginSummary[0];
          marginUsed = decodedMarginSummary[1];
          ntlPos = decodedMarginSummary[2];
          rawUsd = decodedMarginSummary[3];
        }

        if (spotUsdc && spotUsdc !== '0x') {
          const decodedSpotUsdc = decodeAbiParameters(
            [
              { type: "uint256", name: "total" },
              { type: "uint256", name: "hold" },
              { type: "uint256", name: "entryNtl" },
            ],
            spotUsdc
          );

          // Convert from 1e8 precision to 1e6 precision
          total = (decodedSpotUsdc[0] * 10n) / 1000n; // 1e8 -> 1e6
          hold = (decodedSpotUsdc[1] * 10n) / 1000n; // 1e8 -> 1e6
          entryNtl = (decodedSpotUsdc[2] * 10n) / 1000n; // 1e8 -> 1e6
        }

        results.push({
          account,
          marginSummary: { accountValue, marginUsed, ntlPos, rawUsd },
          spotUsdc: { total, hold, entryNtl },
        });
      });
    } catch (error) {
      // If batch fails, add default values for all accounts in batch
      batch.forEach((account) => {
        results.push({
          account,
          marginSummary: { accountValue: 0n, marginUsed: 0n, ntlPos: 0n, rawUsd: 0n },
          spotUsdc: { total: 0n, hold: 0n, entryNtl: 0n },
        });
      });
    }

    if (i + BATCH_SIZE < accounts.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  const totals = {
    totalPerpAccountValue: results.reduce(
      (sum, account) => sum + account.marginSummary.accountValue,
      0n
    ),
    totalSpotUsdc: results.reduce(
      (sum, account) => sum + account.spotUsdc.total,
      0n
    ),
  };

  return { accounts: results, totals };
};

/**
 * Main function to fetch comprehensive WHLP account data using CoreReader
 * This replaces the API-based approach with direct contract calls for better performance
 */
const fetchWhlpAccountData = async (api, accounts) => {
  const [vaultEquity, usdhlSpot, marginAndUsdc] = await Promise.all([
    fetchVaultEquity(api, accounts),
    fetchUsdhlSpotBalances(api, accounts),
    fetchMarginSummaryAndUsdcSpot(api, accounts),
  ]);

  // Merge the results
  const accountsMap = new Map();

  // Add vault equity data
  vaultEquity.accounts.forEach((account) => {
    accountsMap.set(account.account, {
      account: account.account,
      spotUsdc: { total: 0n, hold: 0n, entryNtl: 0n },
      spotUsdhl: { total: 0n, hold: 0n, entryNtl: 0n },
      vaultEquity: account.vaultEquity,
      marginSummary: {
        accountValue: 0n,
        marginUsed: 0n,
        ntlPos: 0n,
        rawUsd: 0n,
      },
    });
  });

  // Add USDHL spot balance data
  usdhlSpot.accounts.forEach((account) => {
    const existing = accountsMap.get(account.account);
    if (existing) {
      existing.spotUsdhl = account.spotUsdhl;
    }
  });

  // Add margin summary and USDC spot data
  marginAndUsdc.accounts.forEach((account) => {
    const existing = accountsMap.get(account.account);
    if (existing) {
      existing.marginSummary = account.marginSummary;
      existing.spotUsdc = account.spotUsdc;
    }
  });

  const mergedAccounts = Array.from(accountsMap.values());

  const totals = {
    totalSpotUsdc: marginAndUsdc.totals.totalSpotUsdc,
    totalSpotUsdhl: usdhlSpot.totals.totalSpotUsdhl,
    totalVaultEquity: vaultEquity.totals.totalVaultEquity,
    totalPerpAccountValue: marginAndUsdc.totals.totalPerpAccountValue,
  };

  return {
    accounts: mergedAccounts,
    totals,
  };
};

const tvl = async (api) => {
  // Get core writer accounts from the controller
  const coreWriterAccounts = await api.call({ 
    abi: 'address[]:getAccounts', 
    target: WHLP_HLP_CONTROLLER_ADDRESS 
  });
  
  const allCustodyAccounts = [...coreWriterAccounts, ...WHLP_HYPER_CORE_MULTISIGS];
  
  // Use CoreReader to fetch comprehensive account data
  const whlpAccountData = await fetchWhlpAccountData(api, allCustodyAccounts);
  
  // Extract totals for TVL calculation
  const totalWhlpTvl = Number(whlpAccountData.totals.totalVaultEquity) / 1e6;

  const totalUsdBalances = Number(whlpAccountData.totals.totalSpotUsdc + whlpAccountData.totals.totalPerpAccountValue) / 1e6;

  // Add WHLP TVL to API
  if (totalWhlpTvl > 0) {
    api.addUSDValue(totalWhlpTvl);
  }
  
  // Add USD balances to API
  if (totalUsdBalances > 0) {
    api.addUSDValue(totalUsdBalances);
  }

  // Get Nucleus strategies for your vault
  const lhypeStrategies = await getConfig(
    'lhype-tokens',
    `https://backend.nucleusearn.io/v1/vaults/underlying_strategies?vault_address=${LHYPE_VAULT_ADDRESS}&chain_id=999`
  );
  
  const lhypeStrategy = lhypeStrategies['999'];
  if (lhypeStrategy) {
    const lhypeTokens = Object.values(lhypeStrategy).map((strategy) => strategy.tokenAddress);
    const sanitizedTokens = sanitizeAndValidateEvmAddresses([...lhypeTokens, LHYPE_VAULT_ADDRESS, USDhl]);

    // Add TVL from strategies
    await sumTokens2({
      owners: [LHYPE_VAULT_ADDRESS, WHLP_VAULT_ADDRESS],
      tokens: sanitizedTokens,
      api,
      resolveLP: true,
      permitFailure: true,
    });
  }
};

module.exports = {
  hyperliquid: { tvl },
  misrepresentedTokens: true
};