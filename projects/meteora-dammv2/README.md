# Meteora DAMM v2 Adapter

This adapter tracks TVL for Meteora's Dynamic Automated Market Maker v2 (DAMM v2) on Solana.

## Files

### index.js (Production)
- **Method**: Uses Meteora's global metrics API endpoint
- **Endpoint**: `https://dammv2-api.meteora.ag/pools/global-metrics`
- **Performance**: Fast, single API call
- **Use Case**: Standard protocol-level TVL tracking

### index-detailed.js (Alternative - Launchpad Filtering)
- **Method**: Fetches all pools via paginated API and sums vault balances
- **Endpoint**: `https://dammv2-api.meteora.ag/pools` (paginated)
- **Performance**: Slower (132k+ pools across 1,322 pages)
- **Use Case**: When filtering by specific launchpads (Believe, Bags, etc.)
- **Features**:
  - Can filter pools by creator address
  - Provides granular pool-level data
  - Skips empty/closed pools automatically

## Usage

### Standard TVL (Current Implementation)
```javascript
// Uses global metrics API - fast and efficient
const tvl = await tvl() // Returns ~$77M USD
```

### Launchpad-Specific TVL (Future Use)
```javascript
// Switch to index-detailed.js and configure FILTER_CREATORS
// Example: Only track Bags launchpad pools
const FILTER_CREATORS = ['1gy7kCxHxX13zLdu4bgwFqsdwdeAWMnLFVLJvwpAXuh']
```

## API Reference
- [DAMM v2 API Docs](https://docs.meteora.ag/api-reference/damm-v2/overview)
- [Protocol Metrics](https://docs.meteora.ag/api-reference/protocol-metrics/get_protocol_metrics)
- Program ID: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
