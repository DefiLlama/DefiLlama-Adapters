const { get } = require('../helper/http');

// One DGLD token corresponds to one fine troy ounce 
// of fully allocated, audited gold held in Swiss custody.
// Token address on Ethereum mainnet
const DGLD_TOKEN = '0xA9299C296d7830A99414d1E5546F5171fA01E9c8';

/**
 * Fetch DGLD token price in USD from GeckoTerminal
 * Note: GeckoTerminal only provides current prices, not historical data
 * @returns {Promise<number|null>} DGLD token price in USD, or null if fetch fails
 */
async function getDGLDPrice() {
  try {
    const url = `https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/${DGLD_TOKEN}`;
    const response = await get(url);

    // Response format: { data: { attributes: { token_prices: { "0x...": "price" } } } }
    const tokenAddressLower = DGLD_TOKEN.toLowerCase();
    if (response.data && response.data.attributes && response.data.attributes.token_prices) {
      const price = response.data.attributes.token_prices[tokenAddressLower];
      if (price) {
        return Number(price);
      }
    }
  } catch (e) {
    // Silently fail and fall back to DefiLlama pricing
  }

  return null;
}

/**
 * TVL function for Ethereum mainnet
 * Always uses GeckoTerminal for pricing
 */
async function ethereumTvl(api) {
  // Get DGLD total supply (in wei, 18 decimals)
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: DGLD_TOKEN,
  });

  if (!totalSupply || BigInt(totalSupply) === 0n) {
    return api.getBalances();
  }

  // Try GeckoTerminal for price
  const dgldPrice = await getDGLDPrice();

  if (dgldPrice && dgldPrice > 0) {
    // Calculate TVL: total supply × price per token
    const totalSupplyInTokens = Number(totalSupply) / 1e18;
    const tvlUSD = totalSupplyInTokens * dgldPrice;
    api.addUSDValue(tvlUSD);
  } else {
    // Fallback: return total supply and let DefiLlama price it using CoinGecko
    const balances = {};
    balances[DGLD_TOKEN] = totalSupply;
    return balances;
  }

  return api.getBalances();
}

module.exports = {
  timetravel: true, // Adapter supports historical data via timestamp parameter
  methodology: 'Calculates TVL by multiplying the DGLD total supply by the current token price from GeckoTerminal (since DGLD is listed on CoinGecko). For historical data, returns total supply and relies on DefiLlama\'s pricing system which uses CoinGecko for historical prices. Each DGLD token represents 1 troy ounce of gold. All tokens are minted on L1 (Ethereum); L2 tokens represent locked L1 tokens, so L1 total supply accounts for all value.',
  start: 1667487203, // Nov 3, 2022 10:53:23 AM UTC - DGLD token deployment (block 15889028, tx: 0x6389d419c38f314ed84ac6a98a3a6715885acecbced80e48b75266511f43ce2e)
  ethereum: {
    tvl: ethereumTvl,
  },
};

