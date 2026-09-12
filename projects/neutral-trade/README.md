# Neutral Trade TVL

The adapter combines Solana vault balances and equity with the underlying assets
of Neutral Trade's Accountable vaults on Ethereum, Monad, and Robinhood Chain.

## Accountable vaults

The addresses in `ACCOUNTABLE_STRATEGIES` are strategy contracts. The adapter
resolves each vault with `vault()` and uses the shared Accountable curator helper
to read `asset()` and calculate `convertToAssets(totalSupply())`.
This includes both deployed assets and idle liquidity. `totalAssets()` only
reports idle assets for these vaults, and the strategies' `lastTotalAssets()`
does not represent their full value.

- Robinhood: Meridian Liquidity Provider, strategy
  `0xF62c201e9A28F6A57C4262004dd2e8B8e95bB1eC`, vault
  `0x24b84023c8e4Da635be228C380C09bfE5271BF9d`, underlying USDe.
- Ethereum: Neutral Trade Autopilot, strategy
  `0x56B935Fe5183cC0DE489233d032F9A4B8ec2f9Ff`, vault
  `0x909dAdBcA7955614A455d9e7447aD4adB4902C8E`, underlying USDC.
- Monad: Neutral Trade Autopilot, strategy
  `0x5ee57E42DF67e5707F0CAE1a18DfeaDB4F0Df86c`, vault
  `0xaABab7598be3c4fE58c593e73C2F5934b73b573E`, underlying USDC.

The adapter is marked `doublecounted` because Accountable also reports these
vaults through its TVL and borrowed buckets, and the Kamino vault allocates
assets to Kamino Lending.

## Kamino coverage

`67dqmR76uAbjX6e81A1ganKv3ou31WUMEdeWJkwVfeXy` (USDC Max Yield) is included
in `KAMINO_VAULTS`. The shared `kaminoLendVaultTvl` helper decodes its vault
account, reads the underlying token and `prevAumSf`, and divides the latter by
2^60 to obtain the last recorded AUM in minor token units. DefiLlama prices the
resulting USDC balance. The public Neutral Trade registry also lists this vault
as type `Kamino`.

## Validation

Install the repository dependencies using the root pnpm lockfile, then run from
the repository root:

```sh
node test.js projects/neutral-trade/index.js
```

The test requires public API and RPC access. Chain RPC overrides are documented
in the repository README. A zero Monad balance is valid while its vault has no
outstanding shares; confirm this with `totalSupply()` when reviewing test output.
