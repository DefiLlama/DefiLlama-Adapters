const { AxiosError } = require("axios");
const axios = require("axios");

/**
 * SecondSwap API endpoint for fetching TVL data
 * @constant {string}
 */
const API_ENDPOINT = "https://secondswap-data-proxy.vercel.app/tvl";

/**
 * Rate limit wait time in milliseconds when 429 error occurs
 * @constant {number}
 */
const RATE_LIMIT_MS = 15_000;

/**
 * Maximum number of retry attempts for API calls
 * @constant {number}
 */
const MAX_RETRIES = 5;

/**
 * Maps DefiLlama chain names to SecondSwap network identifiers (defined in the SecondSwap API server)
 * @constant {Object.<string, string>}
 */
const LLAMA_TO_SECONDSWAP_NETWORKS = {
  ethereum: 'ethereum',
  avax: 'avalanche_c_chain',
  solana: 'solana',
}

/**
 * Fetches Total Value Locked (TVL) for a specific chain from SecondSwap API
 * Implements retry logic with cooldown interval for rate limiting
 * 
 * @param {Object} api - DefiLlama SDK API object
 * @param {string} api.chain - The blockchain network name (ethereum, avax, solana)
 * @returns {Promise<void>} Adds USD value to the api object
 * @throws {Error} When network is unsupported or max retries exceeded
 */
async function tvl(api) {
  let retries = 0;
  let tvlUsd;
  const secondswapNetwork = LLAMA_TO_SECONDSWAP_NETWORKS[api.chain];

  if (!secondswapNetwork) {
    throw new Error(`Unsupported network by SecondSwap: ${api.chain}`);
  }

  while (retries < MAX_RETRIES) {
    try {
      const apiUrl = new URL(API_ENDPOINT);
      const params = new URLSearchParams(apiUrl.search);
      params.set('network', secondswapNetwork);
      apiUrl.search = params.toString();

      const { data } = await axios.get(apiUrl.toString());
      tvlUsd = Number(data.tvlUsd);

      if (isNaN(tvlUsd)) {
        throw new Error(`TVL for ${secondswapNetwork} is not a valid number`);
      } else {
        api.addUSDValue(tvlUsd);
        return;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
        }
      }
      retries++;
    }
  }
}

module.exports = {
  methodology: "SecondSwap facilitates trading and management of locked/vesting tokens. TVL is calculated from on-chain vault balances aggregated via Dune Analytics, then served through SecondSwap's API for programmatic access.",
  timetravel: false,
  ethereum: { tvl },
  avax: { tvl },
  solana: { tvl },
};
