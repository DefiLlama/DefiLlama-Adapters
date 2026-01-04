# DefiLlama Adapter for Chopcorp (LOG Protocol)

TVL adapter for Chopcorp/LOG Protocol on Solana.

## Components

| Export | Description |
|--------|-------------|
| `tvl` | SOL deposits: treasury, wSOL, KOTH vault, automation, prediction markets |
| `staking` | LOG staked by users: yield staking + watchdog competition |

## LOG Pricing

LOG price computed on-chain from Meteora DAMM pool reserves:
- Pool: `6TQRm4JCzFfic7xkfpLR47JQXQj4EBhWp58JuVaRVkiu`
- Price = SOL_vault_balance / LOG_vault_balance

## Program Info

| Field | Value |
|-------|-------|
| Program ID | `chopmfFa3T1CzZj9WUgq5e18aMvjufSHGfPTvyKkydL` |
| LOG Mint | `1ogCsoK7ZqZwiYam9i7xq2j6Bf2LizT6iQtGSp6vCoT` |

## Testing

```bash
cd DefiLlama-Adapters
cp path/to/ore/defillama/index.js projects/chopcorp/
node test.js projects/chopcorp/index.js
```

### Expected Output

```
------ TVL ------
solana-staking            49.30 k
solana                    19.99 k

total                     19.99 k
```

## Links

- [DefiLlama Adapter Guide](https://docs.llama.fi/list-your-project/how-to-write-an-sdk-adapter)
- [Meteora Pool](https://app.meteora.ag/pools/6TQRm4JCzFfic7xkfpLR47JQXQj4EBhWp58JuVaRVkiu)
- [Chopcorp on Solscan](https://solscan.io/account/chopmfFa3T1CzZj9WUgq5e18aMvjufSHGfPTvyKkydL)
