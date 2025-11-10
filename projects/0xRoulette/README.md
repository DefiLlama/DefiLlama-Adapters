# 0xRoulette DeFi Llama Adapter

DeFi Llama TVL adapter for [0xRoulette](https://0xroulette.com) - a non-custodial on-chain game built on a roulette mechanic with LP earnings.

## Overview

This adapter calculates the Total Value Locked (TVL) in the 0xRoulette protocol by:
1. Discovering all vault accounts using `getProgramAccounts`
2. Reading the `total_liquidity` field from each vault
3. Converting raw token amounts to human-readable format using token decimals

## Methodology

- **TVL**: Sum of all `total_liquidity` across all vaults
- **Data Source**: On-chain data via Solana RPC
- **Program ID**: `Rou1svrgkcuo1rBNkP1XaESrD9xRpukx2uLY5MsgK14`

Each vault stores liquidity in a single SPL token. Vaults are created by liquidity providers and hold funds that are used for game payouts. The protocol supports any SPL token, including memecoins.

## Token Pricing

DeFi Llama automatically fetches token prices using their price oracle system, which aggregates data from:
- Jupiter
- Coingecko
- Birdeye
- Other price providers

The adapter simply returns token balances in the format `solana:MINT_ADDRESS`, and DeFi Llama handles the USD conversion automatically.

## Local Testing

```bash
# Install dependencies
npm install
# or
yarn install

# Run the adapter
node index.js

# Run in debug mode to see all program accounts
node index.js --debug
```

## Environment Variables

- `SOLANA_RPC_URL` (optional): Custom Solana RPC endpoint. Defaults to public mainnet RPC.



## Links

- **Website**: https://0xroulette.com
- **Documentation**: https://docs.delaforge.org/roulette
- **Program (verified)**: https://solscan.io/account/Rou1svrgkcuo1rBNkP1XaESrD9xRpukx2uLY5MsgK14
- **GitHub**: https://github.com/Delaforge-org/program-roulette
- **Logo**: https://0xroulette.com/svg/Logo.svg

## Protocol Details

### Vault Structure

Each vault contains:
- `tokenMint`: The SPL token mint address
- `tokenAccount`: The vault's token account
- `totalLiquidity`: Total locked tokens (raw amount)
- `totalProviderCapital`: Capital provided by LPs
- `ownerReward`: Accumulated protocol fees
- `rewardPerShareIndex`: Index for LP reward distribution

### How It Works

1. Liquidity providers create vaults for any SPL token
2. Players place bets using tokens from these vaults
3. Protocol collects ~2.2% fees (~1.4% to LPs, ~0.8% to protocol)
4. TVL represents total funds available for payouts across all vaults

## License

MIT

