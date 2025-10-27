const { getTokenSupplies } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');
const { sumTokens: sumBitcoinTokens } = require('../helper/chain/bitcoin');

// Ethereum zenBTC configuration
const ZENBTC_ETHEREUM = '0x2fE9754d5D28bac0ea8971C0Ca59428b8644C776';

// Solana zenBTC configuration
const ZENBTC_PROGRAM_ID = '9t9RfpterTs95eXbKQWeAriZqET13TbjwDa6VW6LJHFb';

// zrchain treasury wallet endpoint for Bitcoin addresses
const ZRCHAIN_WALLETS_API = 'https://api.diamond.zenrocklabs.io/zrchain/treasury/zenbtc_wallets';

// Cache for supplies to avoid redundant fetches
let suppliesPromise = null;

/**
 * Derives the zenBTC mint address from the program ID using the "wrapped_mint" seed
 */
function getMintAddress() {
  const seeds = [Buffer.from('wrapped_mint')];
  const [address] = PublicKey.findProgramAddressSync(seeds, new PublicKey(ZENBTC_PROGRAM_ID));
  return address.toString();
}

/**
 * Fetches all Bitcoin mainnet addresses from zrchain treasury with pagination
 * Filters for WALLET_TYPE_BTC_MAINNET type only
 */
async function getBitcoinAddresses() {
  const btcAddresses = [];
  let nextKey = null;

  try {
    while (true) {
      let url = ZRCHAIN_WALLETS_API;
      if (nextKey) {
        url += `?pagination.key=${encodeURIComponent(nextKey)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      // Extract Bitcoin mainnet addresses from zenbtc_wallets array
      if (data.zenbtc_wallets && Array.isArray(data.zenbtc_wallets)) {
        for (const walletGroup of data.zenbtc_wallets) {
          if (walletGroup.wallets && Array.isArray(walletGroup.wallets)) {
            for (const wallet of walletGroup.wallets) {
              // Filter for Bitcoin mainnet addresses only
              if (wallet.type === 'WALLET_TYPE_BTC_MAINNET' && wallet.address) {
                btcAddresses.push(wallet.address);
              }
            }
          }
        }
      }

      // Check for next page
      if (data.pagination && data.pagination.next_key) {
        nextKey = data.pagination.next_key;
      } else {
        // No more pages, exit loop
        break;
      }
    }

    console.log(`Fetched ${btcAddresses.length} Bitcoin mainnet addresses from zrchain treasury`);
    return btcAddresses;
  } catch (error) {
    console.error(`Error fetching Bitcoin addresses from zrchain API: ${error.message}`);
    return [];
  }
}

/**
 * Queries Bitcoin balances for all treasury addresses
 * Returns total BTC balance in satoshis
 */
async function getBitcoinTVL() {
  try {
    const btcAddresses = await getBitcoinAddresses();

    if (btcAddresses.length === 0) {
      console.warn('No Bitcoin addresses found in treasury');
      return 0n;
    }

    // Add change address
    const changeAddress = 'bc1qngthd4lgz6pjkf24d2cesltlnd7nd0pjguuvqu';
    btcAddresses.push(changeAddress);

    // Use Bitcoin helper to sum balances for all addresses
    const balances = {};
    await sumBitcoinTokens({ balances, owners: btcAddresses });

    // Extract Bitcoin balance and convert to satoshis (from BTC)
    const btcAmount = balances.bitcoin || 0;
    const satoshis = BigInt(Math.round(btcAmount * 1e8));

    console.log(`Bitcoin TVL from ${btcAddresses.length} addresses: ${satoshis.toString()} satoshis (${btcAmount} BTC)`);
    return satoshis;
  } catch (error) {
    console.error(`Error calculating Bitcoin TVL: ${error.message}`);
    return 0n;
  }
}

/**
 * Queries Ethereum zenBTC supply using the DefiLlama API
 */
async function getEthereumSupply(api) {
  try {
    const supply = await api.call({
      abi: 'erc20:totalSupply',
      target: ZENBTC_ETHEREUM,
      chain: 'ethereum',
    });
    return BigInt(supply);
  } catch (error) {
    console.error(`Error querying Ethereum zenBTC supply: ${error.message}`);
    return 0n;
  }
}

/**
 * Main TVL function - handles both Ethereum and Solana
 * Reports each chain's proportional share of the actual Bitcoin in treasury
 */
async function fetchSupplies(api) {
  // Fetch all data in parallel
  const [custodiedBTC, ethSupply] = await Promise.all([
    getBitcoinTVL(),
    getEthereumSupply(api),
  ]);

  // Query Solana supply using the DefiLlama helper
  const zenbtcMint = getMintAddress();
  const solanaSupplies = await getTokenSupplies([zenbtcMint], { api });
  const solSupply = solanaSupplies[zenbtcMint] ? BigInt(solanaSupplies[zenbtcMint]) : 0n;

  return {
    custodiedBTC,
    ethSupply,
    solSupply,
  };
}

async function tvl(api) {
  const { chain } = api;

  // Store api globally for use in async functions (like ACRED does)
  global.api = api;

  // Use a single promise to ensure only one fetch happens even if called simultaneously
  if (!suppliesPromise) {
    suppliesPromise = fetchSupplies(api);
  }

  const { custodiedBTC, ethSupply, solSupply } = await suppliesPromise;

  console.log(`[${chain}] ethSupply: ${ethSupply}, solSupply: ${solSupply}, custodiedBTC: ${custodiedBTC}`);

  const totalZenBTC = ethSupply + solSupply;

  // Avoid division by zero
  if (totalZenBTC === 0n) {
    const balances = {};
    balances['coingecko:bitcoin'] = '0';
    return balances;
  }

  // Calculate this chain's proportional share of custodied Bitcoin
  let chainSupply = 0n;
  if (chain === 'ethereum') {
    chainSupply = ethSupply;
  } else if (chain === 'solana') {
    chainSupply = solSupply;
  }

  // (chainSupply / totalZenBTC) * custodiedBTC, then convert satoshis to BTC
  const chainBTCAmount = Number((chainSupply * custodiedBTC) / totalZenBTC) / 1e8;

  const balances = {};
  balances['coingecko:bitcoin'] = chainBTCAmount;

  return balances;
}

module.exports = {
  methodology: 'zrchain locks native assets through its decentralized MPC network. zenBTC, Zenrock\'s flagship product, is a yield-bearing wrapped Bitcoin issued on Solana and EVM chains. zenBTC TVL represents the total Bitcoin locked, calculated as the sum of zenBTC supplies across all chains. All zenBTC is fully backed 1:1 by Bitcoin in custody, but the price of zenBTC is anticipated to increase as yield payments are made on a continuous basis.',
  ethereum: {
    tvl,
  },
  solana: {
    tvl,
  },
};

// node test.js projects/zenrock/index.js
