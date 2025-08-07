# Zenchain TVL Adapter

## Protocol Overview

Zenchain is a Bitcoin Layer 1 blockchain with EVM compatibility, optimized for DeFi and NFT applications.

## Implementation

Tracks ZTC token issuance via Substrate RPC queries to the `Balances.TotalIssuance` storage key.

## Network Details

- Chain ID: 8408
- RPC: <https://zenchain-testnet.api.onfinality.io/public>
- Explorer: <https://zentrace.io/>

## Testing

```bash
node test.js projects/zenchain/index.js
```

## Resources

- Documentation: <https://docs.zenchain.io>
- Website: <https://zenchain.io>
