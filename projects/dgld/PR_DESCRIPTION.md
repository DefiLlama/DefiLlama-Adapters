# DGLD Token TVL Adapter

## Overview

This adapter tracks the Total Value Locked (TVL) for the DGLD token on Ethereum mainnet. DGLD is a gold-backed token where each token represents 1 troy ounce of fully allocated, audited gold held in Swiss custody.

## How It Works

The adapter calculates TVL by:
1. Fetching the total supply of DGLD tokens from the Ethereum contract
2. Fetching the current gold price per troy ounce from trusted gold price APIs
3. Calculating TVL = `totalSupply × goldPricePerOunce`

The adapter supports timetravel mode for historical data by using gold price APIs that support historical queries via date endpoints.

## Token Details

- **Token Address**: `0xA9299C296d7830A99414d1E5546F5171fA01E9c8`
- **Token Standard**: ERC-20
- **Decimals**: 18
- **Backing**: 1 DGLD token = 1 troy ounce of gold
- **Deployment**: November 3, 2022 (block 15889028)

## Gold Price Data Sources

The adapter fetches gold prices from multiple trusted APIs and averages them for reliability. Both APIs support historical data queries for timetravel mode:

1. **MetalpriceAPI** - https://metalpriceapi.com/
   - Free tier available
   - Supports historical data via date endpoint
   - API Documentation: https://metalpriceapi.com/documentation

2. **Metals.dev** - https://metals.dev/
   - Free tier: first 100 requests/month
   - Supports historical data via date endpoint
   - API Documentation: https://metals.dev/docs

## Required Environment Variables

The following environment variables need to be added to the DefiLlama infrastructure:

- `METALPRICE_API_KEY` - API key from MetalpriceAPI
- `METALS_DEV_API_KEY` - API key from Metals.dev

**Note**: Both API keys are required for the adapter to function properly. If neither key is available, the adapter will fall back to DefiLlama's token pricing (if DGLD is in their database), but this is not recommended as it may not reflect the actual gold-backed value.

## API Key Setup

To obtain API keys:

1. **MetalpriceAPI**:
   - Sign up at: https://metalpriceapi.com/
   - Get your API key from the dashboard
   - Free tier provides sufficient rate limits for this use case

2. **Metals.dev**:
   - Sign up at: https://metals.dev/
   - Get your API key from the dashboard
   - Free tier provides 100 requests/month (sufficient for daily updates)

## Contact for API Keys

Please ping **@0xDegenDeveloper** on GitHub for the API keys. The keys will be provided securely through the DefiLlama team's preferred method.

## Testing

The adapter has been tested locally and includes debug logging when `LLAMA_DEBUG_MODE=true` is set. To test:

```bash
export LLAMA_DEBUG_MODE="true"
export METALPRICE_API_KEY="your_key_here"
export METALS_DEV_API_KEY="your_key_here"
node test.js projects/dgld/index.js
```

### Expected Output (Current Date)

**With Debug Mode (`LLAMA_DEBUG_MODE=true`):**
```
[DGLD] Total supply (raw): 1603687000000000000000
[DGLD] Total supply (tokens): 1603.687
[DGLD] API timestamp: 1763516626
[DGLD] API block: undefined
[DGLD] Fetching gold price from MetalpriceAPI: https://api.metalpriceapi.com/v1/yesterday?api_key=...&base=USD&currencies=XAU
[DGLD] MetalpriceAPI response: {
  "success": true,
  "base": "USD",
  "timestamp": 1763510399,
  "rates": {
    "USDXAU": 4038.0953919274,
    "XAU": 0.0002476415
  }
}
[DGLD] MetalpriceAPI using USDXAU (USD/oz): 4038.0953919274
[DGLD] MetalpriceAPI price added: 4038.0953919274
[DGLD] Fetching gold price from Metals.dev: https://api.metals.dev/v1/metal/spot?api_key=...&metal=gold&currency=USD
[DGLD] Metals.dev response: {
  "status": "success",
  "timestamp": "2025-11-19T01:44:01.865Z",
  "currency": "USD",
  "unit": "toz",
  "metal": "gold",
  "rate": {
    "price": 4065.65,
    "ask": 4065.86,
    "bid": 4065.38,
    "high": 4078.34,
    "low": 4061.055,
    "change": -1.53,
    "change_percent": -0.04
  }
}
[DGLD] Metals.dev extracted price: 4065.65
[DGLD] Metals.dev price added: 4065.65
[DGLD] All prices fetched: [ 4038.0953919274, 4065.65 ]
[DGLD] Average gold price per ounce: 4051.8726959637
[DGLD] TVL calculation: 1603.687 ounces × 4051.8726959637 USD/oz = 6497935.568171938 USD
--- ethereum ---
USDT                      6.49 M
Total: 6.49 M 

------ TVL ------
ethereum                  6.49 M
total                    6.49 M
```

**Without Debug Mode:**
```
--- ethereum ---
USDT                      6.49 M
Total: 6.49 M 

------ TVL ------
ethereum                  6.49 M
total                    6.49 M
```

### Expected Output (Historical Date - January 1st, 2024)

Test with historical timestamp:
```bash
node test.js projects/dgld/index.js 1704067200
```

**Output:**
```
chain: ethereum block: 18908893 #calls: 4 imprecision: 0.22 (min) Time Taken: 0.53 (in sec)
[DGLD] Total supply (raw): 2836634000000000000000
[DGLD] Total supply (tokens): 2836.634
[DGLD] API timestamp: 1704067200
[DGLD] API block: 18908893
[DGLD] Fetching gold price from MetalpriceAPI: https://api.metalpriceapi.com/v1/2024-01-01?api_key=...&base=USD&currencies=XAU
[DGLD] Fetching gold price from Metals.dev: https://api.metals.dev/v1/timeseries?api_key=...&start_date=2024-01-01&end_date=2024-01-01
[DGLD] Metals.dev extracted price: 2063.1506
[DGLD] Metals.dev price added: 2063.1506
[DGLD] All prices fetched: [ 2063.1506 ]
[DGLD] Average gold price per ounce: 2063.1506
[DGLD] TVL calculation: 2836.634 ounces × 2063.1506 USD/oz = 5852403.1390804 USD
--- ethereum ---
Total: 5.85 M 

------ TVL ------
ethereum                  5.85 M
total                    5.85 M
```

**Note:** At January 1st, 2024:
- Total supply was 2,836.634 tokens (vs current 1,603.687)
- Gold price was $2,063.15/oz (vs current ~$4,050/oz)
- TVL was $5.85M

## Methodology

- **TVL Calculation**: Total DGLD supply × Gold price per troy ounce
- **Data Sources**: On-chain total supply + trusted gold price APIs
- **Timetravel Support**: Yes (via historical gold price API endpoints)
- **Chain**: Ethereum mainnet only (L1 total supply accounts for all tokens, including those bridged to L2)

