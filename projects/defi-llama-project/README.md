# DefiLlama Project Adapter

This adapter tracks the Total Value Locked (TVL) for the DefiLlama Project protocol on Base mainnet.

## Methodology

### TVL Calculation
The adapter calculates TVL by tracking token balances held in the protocol's smart contracts:

- **Lending Protocol TVL**: Sums the balances of USDC, USDT, WETH, and governance tokens held in the lending protocol contract
- **Staking TVL**: Tracks governance tokens staked in the staking contract

### Token Addresses
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **USDT**: `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2`
- **WETH**: `0x4200000000000000000000000000000000000006`
- **Governance Token**: `0x1c76dC283f93C07f35B37307b9e0D554Fe6E6723`

### Contract Addresses
- **Lending Protocol**: `0xDe9221A0A017B07B538C7C5b159456AD43ba603B`
- **Staking Contract**: `0x77D8719e38080723ea0dd5135Bc58d7AF8bb0a77`

## Implementation Details

The adapter uses DefiLlama's `sumTokensExport` helper function to efficiently track token balances across multiple contracts. This approach:

1. Fetches token balances using standard ERC-20 `balanceOf` calls
2. Handles token decimal conversions automatically
3. Provides real-time pricing through DefiLlama's price oracle
4. Supports historical data queries (timetravel: true)

## Testing

To test the adapter locally:

```bash
node test.js projects/defi-llama-project/index.js
```

This will display a breakdown of TVL by token and chain, showing USD values for all tracked assets.
