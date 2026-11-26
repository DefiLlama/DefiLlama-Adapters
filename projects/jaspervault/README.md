# Jasper writer inventory methodology review

This update is proposed for maintainer review. Its Jasper bucket estimates the
gross reference value of trading inventory; it does not establish LP net equity,
redeemable USDC/USDT backing, or eligibility under DefiLlama's TVL methodology.

## Scope and calculation

- Chain: Jasper, EVM chain ID 55531; public RPC `https://rpc-2.jaspervault.io`.
- Scope: the 13 non-demo long/short writer pairs in LiquidationHub's production
  (`beta`, `contractSets.jaspervault_beta.assetLPs`) configuration, copied into
  `config.json`. This is an explicit list, not automatic discovery of all vaults.
- Each vault address and each token/vault balance is counted once.
- Read the manager's registered-token list and all explicitly mapped production
  tokens. Unknown registered tokens with nonzero balances fail the run. Arbitrary
  unregistered ERC20 tokens outside the mapped list are outside the scope.
- Read ERC20 balances and decimals at the same block. JVUSD, JUSDC and USDC use
  an explicit USD 1 assumption. Other tokens use the latest `UpdateNowPrice`
  event from the configured on-chain Binance oracle at or before that block.
  The event feed ID must match the explicit token mapping. Missing, nonpositive
  or future-dated reference prices fail the run.
- Price events may be old. The production trading oracle enforces a 15-second
  validity window for execution; this adapter uses event history as an inventory
  reference and does not claim that the prices are currently executable.
- Use integer arithmetic through the aggregate, then `api.addUSDValue` with
  `misrepresentedTokens: true`. The SDK's aggregate USD/USDT proxy is not an
  assertion that the vaults hold the equivalent amount of USDT.

The initial JVUSD/BTC/ETH/equity-token inventories are minted by the protocol for
trading. Multiplying their balances by reference prices does not prove backing.
No debt, unrealized PnL, capital attribution or redemption reconciliation is
performed. Demo vaults, DJVBTC/DJVUSD tokens, and Base/BSC bridge custody are not
included in the Jasper bucket. We do not set `doublecounted` to imply backing or
resolve overlap with other metrics.

## Migration and history

The existing `jaspervault` registry entry moves into `projects/jaspervault`.
Its Arbitrum, Base and Bitlayer owners/tokens remain unchanged for requested
timestamps before 2026-11-26 00:00 UTC. At and after that boundary, only the
Jasper writer bucket is measured. This is a methodology change, not a transfer
of the same quantity between chains. Existing historical values should not be
replaced with current inventory values or backfilled before the migration.

The Jasper chain key/RPC defaults are added for the native runner. A merged
adapter does not itself confirm production ingestion, chain display metadata,
or website publication. Those need maintainer review and deployment.

## Validation

```bash
node test.js projects/jaspervault/index.js
node test.js projects/jaspervault/index.js jaspervault 2026-11-26
node test.js projects/jaspervault/index.js base 2026-11-25
```

The listing already exists, so this is an update rather than a new-listing
metadata request. Review should determine whether this inventory valuation is
acceptable as TVL before the draft is enabled.
