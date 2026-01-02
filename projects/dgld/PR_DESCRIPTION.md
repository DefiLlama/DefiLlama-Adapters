# DGLD Token TVL Adapter

## Overview

This adapter tracks the Total Value Locked (TVL) for the DGLD token on Ethereum mainnet. DGLD is a gold-backed token where each token represents 1 troy ounce of fully allocated, audited gold held in Swiss custody.

## How It Works

The adapter calculates TVL by:
1. Fetching the total supply of DGLD tokens from the Ethereum contract
2. Fetching the current DGLD token price from GeckoTerminal (since DGLD is listed on CoinGecko)
3. Calculating TVL = `totalSupply × tokenPrice`

For historical data (timetravel mode), the adapter returns the total supply and relies on DefiLlama's pricing system, which uses CoinGecko for historical price data.

## Token Details

- **Token Address**: `0xA9299C296d7830A99414d1E5546F5171fA01E9c8`
- **Token Standard**: ERC-20
- **Decimals**: 18
- **Backing**: 1 DGLD token = 1 troy ounce of gold
- **Deployment**: November 3, 2022 (block 15889028)

## Price Data Source

The adapter fetches DGLD token prices from **GeckoTerminal**, which provides real-time prices for tokens listed on CoinGecko.

- **GeckoTerminal API**: https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0xA9299C296d7830A99414d1E5546F5171fA01E9c8
- **No API keys required**: The GeckoTerminal API is publicly accessible
- **Historical data**: For timetravel mode, the adapter falls back to DefiLlama's pricing system which uses CoinGecko's historical price data

## Testing

The adapter has been tested locally. To test:

```bash
node test.js projects/dgld/index.js
```

**Note**: No API keys are required since GeckoTerminal is publicly accessible.

### Expected Output (Current Date)

```
--- ethereum ---
USDT                      6.55 M
Total: 6.55 M 

------ TVL ------
ethereum                  6.55 M
total                    6.55 M
```

### Expected Output (Historical Date - January 1st, 2024)

Test with historical timestamp:
```bash
node test.js projects/dgld/index.js 1704067200
```

**Output:**
```
chain: ethereum block: 18908893 #calls: 4 imprecision: 0.22 (min) Time Taken: 0.53 (in sec)
--- ethereum ---
Total: 11.59 M 

------ TVL ------
ethereum                  11.59 M
total                    11.59 M
```

**Note:** 
- GeckoTerminal only provides current prices, so for historical queries it returns the current price
- For accurate historical TVL, DefiLlama's backend will use CoinGecko's historical price data when backfilling
- At January 1st, 2024, total supply was 2,836.634 tokens (vs current 1,603.687)

## Methodology

- **TVL Calculation**: Total DGLD supply × DGLD token price (from GeckoTerminal/CoinGecko)
- **Data Sources**: On-chain total supply + GeckoTerminal API (CoinGecko prices)
- **Timetravel Support**: Yes (returns total supply for DefiLlama to price using CoinGecko historical data)
- **Chain**: Ethereum mainnet only (L1 total supply accounts for all tokens, including those bridged to L2)
- **No API Keys Required**: GeckoTerminal is publicly accessible

