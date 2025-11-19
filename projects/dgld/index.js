const { get } = require('../helper/http');
const ADDRESSES = require('../helper/coreAssets.json');

// DGLD token address on Ethereum mainnet
const DGLD_TOKEN = '0xA9299C296d7830A99414d1E5546F5171fA01E9c8';

// One DGLD token always corresponds to one fine troy ounce 
// of fully allocated, audited gold held in Swiss custody.
//
// At the current time (November 18th, 2025), the total supply is
// 1603687000000000000000 (18 decimals) = 1,603.687 ounces. If more gold
// is allocated/un-allocated (minted/burned), the total supply will adjust

/**
 * Fetch current gold price per troy ounce in USD from multiple trusted sources
 * Averages prices from multiple APIs for reliability
 * @param {number} timestamp - Unix timestamp (optional, for historical prices)
 * @returns {Promise<number|null>} Gold price per troy ounce in USD, or null if all sources fail
 */
async function getGoldPricePerOunce(timestamp = null) {
  const prices = [];
  const debugMode = process.env.LLAMA_DEBUG_MODE === 'true';

  // Only use APIs that support historical data via timestamp for timetravel mode
  // Removed: Swissquote (no historical support), Goldpricez (unknown historical support)

  // Source 1: MetalpriceAPI (requires API key, free tier available)
  // Supports historical data via date endpoint
  try {
    const apiKey = process.env.METALPRICE_API_KEY;
    if (apiKey) {
      let url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU`;
      if (timestamp) {
        // For historical data, use date endpoint (YYYY-MM-DD format)
        // Note: API may not support future dates, use yesterday if date is today/future
        const date = new Date(timestamp * 1000).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        if (date >= today) {
          // Use yesterday endpoint for today/future dates
          url = `https://api.metalpriceapi.com/v1/yesterday?api_key=${apiKey}&base=USD&currencies=XAU`;
        } else {
          url = `https://api.metalpriceapi.com/v1/${date}?api_key=${apiKey}&base=USD&currencies=XAU`;
        }
      }
      if (debugMode) {
        console.log('[DGLD] Fetching gold price from MetalpriceAPI:', url);
      }
      const response = await get(url);
      if (debugMode) {
        console.log('[DGLD] MetalpriceAPI response:', JSON.stringify(response, null, 2));
      }
      // Response format: { rates: { XAU: rate, USDXAU: price } }
      // USDXAU is already "USD per ounce" (preferred)
      // XAU is "ounces per USD", so we'd need to invert: 1 / XAU = USD per ounce
      let price = null;
      if (response.rates && response.rates.USDXAU) {
        // USDXAU is already in USD per ounce format
        price = Number(response.rates.USDXAU);
        if (debugMode) {
          console.log('[DGLD] MetalpriceAPI using USDXAU (USD/oz):', price);
        }
      } else if (response.rates && response.rates.XAU) {
        // Fallback: invert XAU rate (ounces per USD → USD per ounce)
        const rate = Number(response.rates.XAU);
        price = 1 / rate;
        if (debugMode) {
          console.log('[DGLD] MetalpriceAPI rate (oz/USD):', rate, '→ price (USD/oz):', price);
        }
      }

      if (price && price > 1000 && price < 15000) {
        if (debugMode) {
          console.log('[DGLD] MetalpriceAPI price added:', price);
        }
        prices.push(price);
      }
    }
  } catch (e) {
    if (debugMode) {
      console.log('[DGLD] MetalpriceAPI error:', e.message);
    }
    // Continue
  }

  // Source 2: Metals.dev API (requires API key, free: first 100 requests/month)
  // Supports historical data via timeseries endpoint
  try {
    const apiKey = process.env.METALS_DEV_API_KEY;
    if (apiKey) {
      let url;
      const today = new Date().toISOString().split('T')[0];
      if (timestamp) {
        // For historical data, use timeseries endpoint with start_date and end_date
        // Timeseries requires both start_date and end_date (same date for single day)
        const date = new Date(timestamp * 1000).toISOString().split('T')[0];
        // If date is today or future, use spot endpoint instead (timeseries doesn't support future dates)
        if (date >= today) {
          url = `https://api.metals.dev/v1/metal/spot?api_key=${apiKey}&metal=gold&currency=USD`;
        } else {
          url = `https://api.metals.dev/v1/timeseries?api_key=${apiKey}&start_date=${date}&end_date=${date}`;
        }
      } else {
        // For current/latest price, use metal/spot endpoint
        url = `https://api.metals.dev/v1/metal/spot?api_key=${apiKey}&metal=gold&currency=USD`;
      }
      if (debugMode) {
        console.log('[DGLD] Fetching gold price from Metals.dev:', url);
      }
      const response = await get(url);
      if (debugMode) {
        console.log('[DGLD] Metals.dev response:', JSON.stringify(response, null, 2));
      }

      let price = null;
      if (response.status === 'success') {
        if (timestamp && response.rates) {
          // Timeseries response format: { rates: { "YYYY-MM-DD": { metals: { gold: price } } } }
          const date = new Date(timestamp * 1000).toISOString().split('T')[0];
          const dayData = response.rates[date];
          if (dayData && dayData.metals && dayData.metals.gold) {
            price = Number(dayData.metals.gold);
          }
        } else if (response.rate && response.rate.price) {
          // Spot endpoint response format: { rate: { price: value } }
          price = Number(response.rate.price);
        }
      }

      if (price && debugMode) {
        console.log('[DGLD] Metals.dev extracted price:', price);
      }
      if (price && price > 1000 && price < 10000) {
        if (debugMode) {
          console.log('[DGLD] Metals.dev price added:', price);
        }
        prices.push(price);
      }
    }
  } catch (e) {
    if (debugMode) {
      console.log('[DGLD] Metals.dev API error:', e.message);
    }
    // Continue
  }

  // Return average of all successful price fetches
  if (prices.length > 0) {
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    if (debugMode) {
      console.log('[DGLD] All prices fetched:', prices);
      console.log('[DGLD] Average gold price per ounce:', averagePrice);
    }
    return averagePrice;
  }

  // All sources failed - return null to trigger fallback
  // In fallback mode, DefiLlama will try to price DGLD token if it's in their database
  if (debugMode) {
    console.log('[DGLD] All gold price APIs failed, using fallback');
  }
  return null;
}

/**
 * TVL function for Ethereum mainnet
 * Calculates TVL as: DGLD total supply × gold price per troy ounce
 * Each DGLD token = 1 troy ounce of gold
 */
async function ethereumTvl(api) {
  const debugMode = process.env.LLAMA_DEBUG_MODE === 'true';

  // Get DGLD total supply (in wei, 18 decimals)
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: DGLD_TOKEN,
  });

  if (debugMode) {
    console.log('[DGLD] Total supply (raw):', totalSupply);
    console.log('[DGLD] Total supply (tokens):', Number(totalSupply) / 1e18);
    console.log('[DGLD] API timestamp:', api.timestamp);
    console.log('[DGLD] API block:', api.block);
  }

  // Get gold price per troy ounce
  // Use timestamp from api if available, otherwise current time
  // For timetravel, api.timestamp will be the historical timestamp
  const timestamp = api.timestamp || Math.floor(Date.now() / 1000);
  const goldPricePerOunce = await getGoldPricePerOunce(timestamp);

  if (!totalSupply || BigInt(totalSupply) === 0n) {
    return api.getBalances();
  }

  // Calculate TVL in USD
  // totalSupply is in wei (18 decimals), so divide by 1e18 to get token amount
  // Each token represents 1 troy ounce of gold
  const totalSupplyInOunces = Number(totalSupply) / 1e18;

  if (goldPricePerOunce && goldPricePerOunce > 0) {
    // Calculate TVL: total ounces × price per ounce
    const tvlUSD = totalSupplyInOunces * goldPricePerOunce;
    if (debugMode) {
      console.log('[DGLD] TVL calculation:', totalSupplyInOunces, 'ounces ×', goldPricePerOunce, 'USD/oz =', tvlUSD, 'USD');
    }
    api.addUSDValue(tvlUSD);
  } else {
    // Fallback: return total supply and let DefiLlama price it if DGLD is in their database
    if (debugMode) {
      console.log('[DGLD] Using fallback: returning total supply for DefiLlama pricing');
    }
    const balances = {};
    balances[DGLD_TOKEN] = totalSupply;
    return balances;
  }

  return api.getBalances();
}

module.exports = {
  timetravel: true, // Adapter supports historical data via timestamp parameter
  methodology: 'Calculates TVL by multiplying the DGLD total supply by the current gold price per troy ounce. Each DGLD token represents 1 troy ounce of gold. Gold price is fetched from trusted gold price APIs that support historical data (MetalpriceAPI, Metals.dev) and averaged for reliability. All tokens are minted on L1 (Ethereum); L2 tokens represent locked L1 tokens, so L1 total supply accounts for all value.',
  start: 1667487203, // Nov 3, 2022 10:53:23 AM UTC - DGLD token deployment (block 15889028, tx: 0x6389d419c38f314ed84ac6a98a3a6715885acecbced80e48b75266511f43ce2e)
  ethereum: {
    tvl: ethereumTvl,
  },
};

