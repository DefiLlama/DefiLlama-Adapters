const { getLogs } = require('../helper/cache/getLogs');

/**
 * Flying Tulip PutManager contract address on Ethereum mainnet.
 * Manages FT token offerings and PUT positions.
 * @type {string}
 */
const PUT_MANAGER = '0xbA49d0AC42f4fBA4e24A8677a22218a4dF75ebaA';

/**
 * FT token contract address on Ethereum mainnet.
 * @type {string}
 */
const FT_TOKEN = '0x5DD1A7A369e8273371d2DBf9d83356057088082c';

/**
 * FT Oracle contract address for price feeds.
 * @type {string}
 */
const FT_ORACLE = '0xC8C895E2be9511006287Ce02E51B5B198AB36793';

/**
 * Initial FT token supply (10 billion tokens).
 * @type {bigint}
 */
const INITIAL_FT_SUPPLY = BigInt('10000000000000000000000000000'); // 10B * 1e18

/**
 * Block number when PutManager was deployed.
 * @type {number}
 */
const PUT_MANAGER_FROM_BLOCK = 21895793;

/**
 * Fetches total FT withdrawn by summing all Withdraw events from PutManager.
 * @param {Object} api - DefiLlama SDK API instance
 * @returns {Promise<bigint>} Total FT withdrawn in wei
 */
async function getFTWithdrawn(api) {
  const logs = await getLogs({
    api,
    target: PUT_MANAGER,
    eventAbi: 'event Withdraw(address indexed user, uint256 amount)',
    fromBlock: PUT_MANAGER_FROM_BLOCK,
    onlyArgs: true,
  });

  let totalWithdrawn = BigInt(0);
  for (const log of logs) {
    totalWithdrawn += BigInt(log.amount);
  }
  return totalWithdrawn;
}

/**
 * Fetches FT token price from the oracle.
 * Oracle returns ftPerUSD scaled by 1e8.
 * @param {Object} api - DefiLlama SDK API instance
 * @returns {Promise<number|null>} FT price in USD, or null if invalid
 */
async function getFTPrice(api) {
  const ftPerUSD = await api.call({
    target: FT_ORACLE,
    abi: 'uint256:ftPerUSD',
  });

  // Guard against zero or invalid values
  const ftPerUSDNum = Number(ftPerUSD);
  if (!ftPerUSDNum || !Number.isFinite(ftPerUSDNum) || ftPerUSDNum <= 0) {
    return null;
  }

  // ftPerUSD is scaled by 1e8, so 1e9 means 10 FT per USD = $0.10
  return 1 / (ftPerUSDNum / 1e8);
}

/**
 * Scales down a BigInt value by decimals for safe display.
 * Uses string manipulation to preserve precision for large numbers.
 * @param {bigint|string} value - The value to scale down
 * @param {number} decimals - Number of decimals (default 18)
 * @returns {string} Formatted number string
 */
function formatBigIntTokens(value, decimals = 18) {
  const bigValue = BigInt(value);
  const divisor = 10n ** BigInt(decimals);
  const integerPart = bigValue / divisor;
  const remainder = bigValue % divisor;

  // Format integer part with commas
  const intStr = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Add decimal places if there's a remainder (limit to 2 decimal places for readability)
  if (remainder > 0n) {
    const decimalStr = remainder.toString().padStart(decimals, '0').slice(0, 2);
    if (decimalStr !== '00') {
      return `${intStr}.${decimalStr}`;
    }
  }

  return intStr;
}

/**
 * Calculates USD value from BigInt token amount and price.
 * @param {bigint|string} tokenAmount - Token amount in wei (18 decimals)
 * @param {number} priceUsd - Price per token in USD
 * @returns {number} USD value
 */
function calculateUsdValue(tokenAmount, priceUsd) {
  // Convert to number after scaling down to avoid precision loss on large values
  // Use BigInt division for the integer part, then multiply by price
  const bigValue = BigInt(tokenAmount);
  const divisor = 10n ** 18n;
  const scaledValue = Number(bigValue / divisor) + Number(bigValue % divisor) / 1e18;
  return scaledValue * priceUsd;
}

/**
 * Comprehensive FT token and protocol statistics check.
 * Displays FT supply, circulation, oracle price, and FDV.
 * @param {Object} api - DefiLlama SDK API instance
 * @returns {Promise<void>}
 */
async function checkFT(api) {
  // Get pFT address (may fail if contract doesn't expose this)
  let pFT = null;
  try {
    pFT = await api.call({
      target: PUT_MANAGER,
      abi: 'address:pFT',
    });
  } catch (e) {
    // pFT call not supported
  }

  // Get FT offering supply
  const ftOfferingSupply = await api.call({
    target: PUT_MANAGER,
    abi: 'uint256:ftOfferingSupply',
  });

  // Get FT allocated
  const ftAllocated = await api.call({
    target: PUT_MANAGER,
    abi: 'uint256:ftAllocated',
  });

  // Get FT total supply
  const totalSupply = await api.call({
    target: FT_TOKEN,
    abi: 'erc20:totalSupply',
  });

  // Get FT withdrawn from events
  const ftWithdrawn = await getFTWithdrawn(api);

  // Calculate burned FT (initial supply - current total supply)
  const ftBurned = INITIAL_FT_SUPPLY - BigInt(totalSupply);

  // Get FT price from oracle
  const ftPrice = await getFTPrice(api);

  // Calculate circulating supply (withdrawn FT that's in user wallets)
  const ftCirculating = ftWithdrawn;

  // Calculate FDV and market cap (only if price is valid)
  const fdv = ftPrice ? calculateUsdValue(totalSupply, ftPrice) : null;
  const circulatingMarketCap = ftPrice ? calculateUsdValue(ftCirculating, ftPrice) : null;

  const formatUSD = (n) => {
    if (n === null || n === undefined || !Number.isFinite(n)) {
      return 'N/A';
    }
    return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (pFT) {
    console.log('pFT NFT Contract:', pFT);
  }

  console.log('\n--- FT Token Stats ---');
  console.log('Initial Supply: 10,000,000,000 FT');
  console.log('Current Total Supply:', formatBigIntTokens(totalSupply), 'FT');
  console.log('FT Burned:', formatBigIntTokens(ftBurned), 'FT');
  console.log('FT Offering Supply:', formatBigIntTokens(ftOfferingSupply), 'FT');
  console.log('FT Allocated in PUTs:', formatBigIntTokens(ftAllocated), 'FT');
  console.log('FT Withdrawn:', formatBigIntTokens(ftWithdrawn), 'FT');

  console.log('\n--- FT Pricing ---');
  console.log('FT Price (Oracle):', ftPrice ? formatUSD(ftPrice) : 'N/A');
  console.log('Circulating Supply:', formatBigIntTokens(ftCirculating), 'FT');
  console.log('Circulating Market Cap:', formatUSD(circulatingMarketCap));
  console.log('FDV:', formatUSD(fdv));
}

module.exports = { checkFT };
