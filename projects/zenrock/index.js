const { getTokenSupplies } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');

// Ethereum zenBTC configuration
const ZENBTC_ETHEREUM = '0x2fE9754d5D28bac0ea8971C0Ca59428b8644C776';

// Solana zenBTC configuration
const ZENBTC_PROGRAM_ID = '9t9RfpterTs95eXbKQWeAriZqET13TbjwDa6VW6LJHFb';

// zrchain API endpoint for actual custodied Bitcoin
const ZRCHAIN_API = 'https://api.diamond.zenrocklabs.io/zenbtc/supply';

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
 * Fetches the actual custodied Bitcoin amount from zrchain API
 * This represents the real BTC locked by the protocol
 */
async function getCustodiedBTC() {
  try {
    const response = await fetch(ZRCHAIN_API);
    const data = await response.json();
    // custodiedBTC is in satoshis (8 decimals)
    return BigInt(data.custodiedBTC);
  } catch (error) {
    console.error(`Error fetching custodied BTC from zrchain API: ${error.message}`);
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
 * Reports each chain's proportional share of the custodied Bitcoin
 */
async function fetchSupplies(api) {
  // Fetch all data in parallel
  const [custodiedBTC, ethSupply] = await Promise.all([
    getCustodiedBTC(),
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

// node test.js projects/zrchain/index.js
