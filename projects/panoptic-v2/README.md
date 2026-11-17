# Panoptic V2 TVL

The adapter covers Ethereum and Robinhood. It sums the existing Panoptic collateral-tracker assets, eligible balances held by registered Panoptic vaults, verified external ERC-4626 allocations, and standalone SFPM token inventory.

## Accounting boundaries

- Pool assets use the existing factory-discovered collateral trackers and their `totalAssets()` values. A vault's collateral-tracker shares and PanopticPool-owned SFPM positions are not added again.
- Vault reserves use token balances at the requested block, including pending deposits and reserved withdrawals while still held by the vault. The token set includes the vault underlying, pool assets, native currency, and wrapped native currency. The vault allowlist includes the current and withdrawal-only Ethereum vaults and the Robinhood vault; the permissionless HypoVault factory is not an allowlist.
- External allocations value only shares owned by the registered vault, using `convertToAssets`. Their ordered address list must match the accountant's onchain allocation hash at the snapshot. A new or changed allocation fails until its effective block range and backing have been verified in `config.js`. All five registered vaults had empty external allocation lists at Ethereum block 26433261 and Robinhood block 116405252. Their valuation path is covered by regression fixtures.
- A permitted external vault must not itself invest in assets already included by the Panoptic adapter, including Panoptic collateral or standalone SFPM positions. Checking `asset()` and the accountant hash verifies denomination and list membership, not the external strategy's backing. Audit the external strategy before adding it to the registry. Nested receipt denominations are rejected.
- Standalone SFPM ownership is determined by the account calling the SFPM. Normal option mints are owned by the PanopticPool contract and are excluded using the factory registry. Underlying Uniswap pool membership does not determine ownership.
- Historical SFPM mints discover account/range keys. `getAccountLiquidity` at the requested block reflects partial burns, full closes, and temporary swap round trips. Each resolved pool/account/tokenType/range is valued once, even if multiple token IDs or SFPM IDs share it. Pool identity comes from the SFPM's V3 address or V4 PoolKey getter. Both token amounts use exact integer liquidity math and the snapshot sqrt price.

This change retains the existing pool accounting, including loan receivables and unrealized interest in `totalAssets()`. It does not implement consolidated debt netting or trace whether borrowed proceeds fund other holdings. The ownership and receipt exclusions prevent counting the same pool position twice; they do not establish a fully consolidated measure of unleveraged capital. Standalone liquidity excludes removed liquidity, width-zero loans/credits, and accrued fees.

## Validation

Run from the repository root:

```sh
pnpm lint
pnpm test projects/panoptic-v2/index.js
pnpm test projects/panoptic-v2/index.js 2026-10-30
pnpm test projects/panoptic-v2/index.js ethereum 2026-06-10
pnpm exec node --test tests/panoptic-v2.test.js
pnpm build
```

At fixed blocks 26433261 on Ethereum and 116405252 on Robinhood, the pool component matched the previous adapter's raw balances exactly. The Ethereum additions were 1083042378 raw USDC, 4534770727715157 raw WETH, and 8962873938 wei held by registered vaults; standalone WETH/SOL liquidity added 1780714524810867 raw WETH and 54341962 raw SOL. Robinhood had no additional reserves or standalone liquidity at its fixed snapshot. Snapshot prices determine the two inventory amounts, so later blocks can differ.

The live V4 PoolKey, price, and account-liquidity read path was also exercised on both chains using historical protocol-owned positions. These positions remain excluded in the actual adapter.

The Panoptic app currently adds idle vault balances locally to DeFiLlama TVL. Coordinate its removal after the updated upstream API and relevant historical backfill are verified, or the app will add those reserves twice. Existing DeFiLlama loan accounting and classification of cross-protocol deposits remain separate methodology decisions.
