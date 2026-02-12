const { getConfig } = require('../helper/cache');
const { getAssociatedTokenAddress, getTokenAccountBalances } = require('../helper/solana');

/**
 * SecondSwap API base URL and endpoints
 * @constant {string}
 */
const BASE_API_URL = "https://secondswap-data-proxy.vercel.app";
const VAULTS_API = `${BASE_API_URL}/vesting-vaults`;
const TOKENS_API = `${BASE_API_URL}/tokens-info`;

/**
 * Maps DefiLlama chain identifiers to SecondSwap network names
 * SecondSwap deploys on multiple chains with separate vesting contracts per chain
 * @constant {Object.<string, string>}
 */
const LLAMA_TO_SECONDSWAP_CHAINS = {
  ethereum: 'ethereum',
  avax: 'avalanche_c_chain',
  solana: 'solana',
};

/**
 * Fetches list of vesting vault contracts for a specific blockchain
 * 
 * Each vesting plan on SecondSwap deploys a dedicated vault that holds the locked tokens.
 * Vault addresses are indexed from on-chain deployment events via Dune Analytics.
 * 
 * **Data Structure by Chain:**
 * - **EVM chains (Ethereum, Avalanche):**
 *   - `vesting_address`: Vault contract address (holds the tokens)
 *   - `token_address`: ERC20 token contract address
 * 
 * - **Solana:**
 *   - `vesting_address`: PDA of the vesting plan (program authority)
 *   - `token_address`: SPL token mint address
 *   - Note: The actual token account (ATA) is derived from getAssociatedTokenAddress(mint, PDA)
 * 
 * @param {string} secondswapChain - SecondSwap network identifier (e.g., 'ethereum', 'avalanche_c_chain', 'solana')
 * @returns {Promise<Array<{vesting_address: string, token_address: string}>>} 
 *          Array of vault objects with addresses structured according to the chain type
 */
async function fetchVestingVaults(secondswapChain) {
  const data = await getConfig(
    `secondswap/vaults/${secondswapChain}`,
    `${VAULTS_API}?chain=${secondswapChain}`,
  );
  const vaults = data?.vaults ?? data;
  return Array.isArray(vaults) ? vaults : [];
}

/**
 * Fetches token metadata (address, decimals, price) from SecondSwap API
 * 
 * Token data is sourced from the Dune Analytics view `dune.secondswapio.result_get_token_metadata_prices`,
 * which aggregates pricing information from multiple sources:
 * - Dune Analytics blockchain data
 * - CoinGecko API for mainstream tokens
 * - SecondSwap proprietary data for tokens lacking coverage on major aggregators
 * 
 * This hybrid approach ensures comprehensive price coverage for all tokens locked in SecondSwap vaults,
 * including obscure or newly launched tokens.
 * 
 * @param {string} secondswapChain - SecondSwap network identifier (e.g., 'ethereum', 'avalanche_c_chain', 'solana')
 * @returns {Promise<Array<{contract_address: string, decimals: number, price: number}>>}
 *          Array of token metadata objects with contract address, decimal places, and USD price
 */
async function fetchTokensInfo(secondswapChain) {
  const data = await getConfig(
    `secondswap/tokens/${secondswapChain}`,
    `${TOKENS_API}?chain=${secondswapChain}`,
  );
  const tokens = data?.tokens ?? data;
  return Array.isArray(tokens) ? tokens : [];
}

/**
 * Calculates Total Value Locked (TVL) for SecondSwap vesting vaults on a specific chain
 * 
 * SecondSwap's TVL represents the total value of tokens currently locked in vesting contracts.
 * Each vesting plan creates a dedicated vault that holds the tokens until they vest.
 * 
 * **Calculation Process:**
 * 1. Fetch vault addresses and their associated token addresses from SecondSwap API
 *    (vault addresses are indexed from on-chain deployment events via Dune Analytics)
 * 2. Query each vault's token balance on-chain (method differs by chain type)
 * 3. Fetch token prices and decimals from SecondSwap API (sourced from Dune, CoinGecko, and proprietary data)
 * 4. Calculate TVL using formula: SUM(balance_raw / 10^decimals * price_usd) for all vaults
 * 
 * **Balance Query Architecture by Chain:**
 * - **EVM chains (Ethereum, Avalanche):** 
 *   - Vault is a smart contract, token is ERC20
 *   - Query: `token.balanceOf(vaultAddress)` 
 * - **Solana:** 
 *   - Vault is a PDA, tokens held in an ATA (Associated Token Account)
 *   - ATA is derived from: `getAssociatedTokenAddress(tokenMint, vestingPDA)`
 *   - Query: Get token account balance using the derived ATA address
 * 
 * @param {Object} api - DefiLlama SDK ChainApi object with methods for on-chain queries
 * @param {string} api.chain - Blockchain identifier (e.g., 'ethereum', 'avax', 'solana')
 * @returns {Promise<void>} Adds calculated USD value to the api object via api.addUSDValue()
 * @throws {Error} If the chain is not supported by SecondSwap
 */
async function tvl(api) {
  const secondswapChain = LLAMA_TO_SECONDSWAP_CHAINS[api.chain];

  if (!secondswapChain) {
    throw new Error(`Unsupported network: ${api.chain}`);
  }

  const vaults = await fetchVestingVaults(secondswapChain);
  if (vaults.length === 0) return;

  let balances;
  let tokenMints;

  if (api.chain === 'solana') {
    tokenMints = vaults.map((vault) => vault.token_address);
    
    const ataAddresses = vaults.map((vault) => {
      return getAssociatedTokenAddress(vault.token_address, vault.vesting_address);
    });
    
    const tokenAccountBalances = await getTokenAccountBalances(ataAddresses, { 
      individual: true,
      chain: api.chain 
    });
    
    balances = tokenAccountBalances.map(item => item.balance);
    
  } else {
    tokenMints = vaults.map((vault) => vault.token_address);
    balances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: tokenMints.map((token, i) => ({
        target: token,
        params: [vaults[i].vesting_address],
      })),
    });
  }

  const tokensInfo = await fetchTokensInfo(secondswapChain);
  
  const priceMap = {};
  for (const token of tokensInfo) {
    const address = token.contract_address.toLowerCase();
    priceMap[address] = {
      price: Number(token.price) || 0,
      decimals: Number(token.decimals) || 18,
    };
  }

  let totalTvlUsd = 0;
  tokenMints.forEach((tokenMint, i) => {
    const address = tokenMint.toLowerCase();
    const balance = balances[i];
    const tokenInfo = priceMap[address];

    if (tokenInfo && tokenInfo.price > 0 && balance) {
      const balanceRaw = BigInt(balance);
      const divisor = BigInt(10 ** tokenInfo.decimals);
      const balanceNormalized = Number(balanceRaw) / Number(divisor);
      const valueUsd = balanceNormalized * tokenInfo.price;
      totalTvlUsd += valueUsd;
    }
  });

  api.addUSDValue(totalTvlUsd);
}

module.exports = {
  methodology: `SecondSwap is a decentralized marketplace for trading and managing locked/vesting tokens. TVL represents the total value of tokens currently locked in vesting contracts across all chains. 
  
  Calculation methodology:
  1. Vault Discovery: Fetch vault contract addresses indexed from on-chain deployment events via Dune Analytics
  2. Balance Queries: 
     - EVM (Ethereum, Avalanche): Query token.balanceOf(vaultAddress) for each ERC20 token
     - Solana: Derive ATA from getAssociatedTokenAddress(mint, PDA) and query token account balance
  3. Price Application: Apply token prices sourced from Dune, CoinGecko, and SecondSwap proprietary data
  4. TVL Formula: SUM(balance_raw / 10^decimals * price_usd) across all vaults
  
  Architecture: Each vesting plan deploys a dedicated vault - a smart contract on EVM chains (Ethereum, Avalanche) or a PDA on Solana - that holds the locked tokens until they vest according to the plan schedule.`,
  timetravel: false,
  ethereum: { tvl },
  avax: { tvl },
  solana: { tvl },
};