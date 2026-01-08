const { timetravel } = require('../algodex');
const { get } = require('../helper/http')

// Default backend URL - can be overridden via environment variable
const BACKEND_URL = "https://info.althea.zone:9000";
const UNPRICED_TVL_ENDPOINT = "unpriced_tvl";

// Fetches the token balances held on the Althea L1 chain by querying the Althea info server, which is open source and available at https://github.com/AltheaFoundation/info-server
// TVL is made up of the native ALTHEA token, tokens bridged from Ethereum and other Cosmos chains over IBC, and native ERC20 tokens that live in the EVM module of Althea L1.
async function tvl(api) {
  try {
    // Fetch TVL data from the Althea backend endpoint
    const { althea_on_chain, ibc_tokens_on_chain, althea_native_erc20s_on_chain } = await get(`${BACKEND_URL}/${UNPRICED_TVL_ENDPOINT}`)

    // Helper function to process a TokenAmount and add it to the API
    function addTokenAmount(tokenAmount) {
      const { token, amount } = tokenAmount;

      // Skip tokens without a coingecko_id
      if (!token.coingecko_id) {
        return;
      }

      // Convert amount from Uint256 string to decimal number
      // The amount is in the smallest unit (like wei for ETH), so we divide by 10^decimals
      const balance = Number(amount) / Math.pow(10, token.decimals);

      api.addCGToken(token.coingecko_id, balance);
    }

    // Process Althea native token on chain
    if (althea_on_chain) {
      addTokenAmount(althea_on_chain);
    }

    // Process IBC tokens on chain
    if (ibc_tokens_on_chain) {
      ibc_tokens_on_chain.forEach(addTokenAmount);
    }

    // Process Althea native ERC20s on chain
    if (althea_native_erc20s_on_chain) {
      althea_native_erc20s_on_chain.forEach(addTokenAmount);
    }

  } catch (error) {
    throw new Error(`Failed to fetch Althea TVL: ${error.message}`);
  }
}

module.exports = {
  methodology: "Aggregates liquidity of the native token, bridged tokens, and native ERC20s on Althea L1",
  timetravel: false,
  althea_l1: {
    tvl
  }
};