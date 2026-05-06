# Adapter Patterns

Use this reference to choose repo-native adapter patterns. Inspect the named files before implementing; do not rely on this summary alone when editing.

## Runtime model

`test.js` loads an adapter module or falls back to `registries.allProtocols` for registry-backed modules. It removes dead chains, validates chain names and export keys, rejects old root-level exports such as root `tvl`, `staking`, `pool2`, `borrowed`, `treasury`, `offers`, and `vesting`, runs each chain bucket with `sdk.ChainApi`, prices balances, and fails when total `tvl` is missing.

Valid export keys are listed in `projects/helper/whitelistedExportKeys.json`: `tvl`, `staking`, `methodology`, `pool2`, `misrepresentedTokens`, `timetravel`, `borrowed`, `start`, `doublecounted`, `hallmarks`, `isHeavyProtocol`, `deadFrom`, `ownTokens`, `meta`, `moduleFilePath`, and `vesting`.

## Pattern table

| Protocol shape | Prefer | Inspect examples | Common mistakes |
| --- | --- | --- | --- |
| Simple owner/token balances | Custom `projects/<protocol>/index.js` with `sumTokensExport` or `sumTokens2` | `projects/friendroom/index.js`, `projects/nerve/index.js`, `projects/helper/unwrapLPs.js`, `projects/helper/sumTokens.js` | Missing native token handling, wrong owner/token pairs, counting protocol-owned tokens as TVL |
| Staking or pool2 only | `registries/stakingOnly.js` or helper `staking`/`pool2` in custom adapter | `registries/stakingOnly.js`, `projects/pdollar/index.js`, `projects/helper/staking.js`, `projects/helper/pool2.js` | Counting staking as base `tvl`, omitting dummy empty `tvl` for staking-only registry pattern |
| ERC4626 vaults | `registries/erc4626.js` when plain vault list fits | `registries/erc4626.js`, `projects/helper/erc4626.js` | Using custom code for plain vaults, forgetting `doublecounted` when vault assets are deployed into already-listed protocols |
| Uniswap V2/factory AMM | `registries/uniswapV2.js` when factory config fits | `registries/uniswapV2.js`, `projects/helper/unknownTokens.js` | Missing stable-pool options, wrong factory, blacklisted tokens omitted |
| Uniswap V3/concentrated liquidity | `registries/uniswapV3.js` or `registries/uniswapV3Graph.js` | `registries/uniswapV3.js`, `registries/uniswapV3Graph.js`, `projects/helper/uniswapV3.js` | Missing `fromBlock`, wrong Algebra/Uniswap event shape, overusing `permitFailure` |
| Aave fork | `registries/aave.js` or `registries/aaveV3.js` | `registries/aave.js`, `registries/aaveV3.js`, `projects/helper/aave.js` | Counting debt as TVL, wrong registry/data helper, missing insolvent handling |
| Compound fork | `registries/compound.js` | `registries/compound.js`, `projects/helper/compound.js` | Not identifying cETH/native market, counting borrowed balances as TVL, missing blacklisted markets/tokens |
| MasterChef/farms | `registries/masterchef.js` when config fits | `registries/masterchef.js`, `projects/helper/masterchef.js`, `projects/helper/unknownTokens.js` | Misclassifying protocol-token farms, bad LP pricing for unknown tokens |
| API-assisted discovery with chain-backed TVL | Custom adapter using cache/http for lists, then chain calls | `projects/yearn/index.js`, `projects/helper/cache.js`, `projects/helper/http.js` | Returning API TVL directly, stale config without fallback reasoning |
| Non-EVM balances | Chain-specific helpers via `projects/helper/sumTokens.js` | `projects/genius-yield/index.js`, `projects/helper/sumTokens.js`, `projects/helper/chain/cardano.js`, `projects/helper/solana.js` | Using EVM address assumptions, unsupported chain handler, token key format mistakes |
| Treasury or entity holdings | `projects/treasury/*` or `projects/entities/*` with treasury helpers | `projects/treasury/createDAO.js`, `projects/helper/treasury.js` | Mixing treasury holdings into protocol TVL, failing to separate `ownTokens` |
| Legacy fetch/API-only | Avoid for new adapters | `projects/vestaequity/index.js` is a dead legacy example | Creating a new adapter that returns `toUSDTBalances(apiTotal)` from a third-party TVL endpoint |

## Registry selection

Check `registries/index.js` for available registry families. Registry-backed adapters are appropriate when the protocol is a straightforward config instance of an existing family such as Uniswap V2/V3, Aave, Compound, ERC4626, MasterChef, staking-only, Balancer, GMX, or Solana stake pool.

Use a custom project adapter when:

- methodology is not standard for the registry
- multiple helper families must be composed
- discovery requires custom logs/API/config plus chain calls
- non-EVM support needs a chain-specific helper
- registry config would hide important assumptions

## Bucket classification

Use chain-level buckets:

```js
module.exports = {
  methodology: '...',
  ethereum: {
    tvl,
    staking,
    pool2,
    borrowed,
    ownTokens,
  },
}
```

Do not export root-level `tvl`, `staking`, `pool2`, `borrowed`, `treasury`, `offers`, or `vesting` for normal project adapters. `test.js` rejects that shape.

## What CI catches

`test.js` and PR CI can catch invalid chain names, invalid export keys, missing total TVL, thrown runtime errors, stale or missing prices in output, unknown tokens in output, and package/lockfile changes according to `.github/workflows/test.yml`.

## What CI does not prove

Passing tests does not prove the methodology is right, all assets are included, double-counting is handled, API discovery is complete, token pricing is economically sound, the PR template is complete, or the user has chosen the correct DefiLlama repo.
