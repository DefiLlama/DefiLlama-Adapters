# SSS DeFi TVL Adapter

SSS DeFi is a fully on-chain, canister-based DEX on the Internet Computer.

## TVL methodology

TVL is calculated from live raw reserves of enabled public non-legacy canonical SSS pools.

Included assets:

```text
ICP
ETH
USDC
USDT
```

Included public pools:

```text
9  ICP/USDT  10 bps
10 ICP/USDC  10 bps
11 ETH/USDT  10 bps
12 ETH/USDC  10 bps
13 USDC/USDT 10 bps
14 USDC/USDT 1 bps
```

Excluded from TVL:

* user available balances;
* pending deposits;
* pending withdrawals;
* route reserves;
* treasury reserves;
* protocol fee vaults;
* referral liabilities;
* hidden pools;
* disabled pools;
* legacy pools;
* settlement-route assets.

## Data source

```text
https://dlhkk-raaaa-aaaak-qyl5a-cai.raw.icp0.io/api/external/v1/live/tvl_inputs.json
```

Pool ids are SSS synthetic ids, not EVM pair contract addresses:

```text
sss:<core_canister>:pool:<pool_id>
```
