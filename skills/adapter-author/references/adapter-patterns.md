# Adapter Patterns

Use this reference to choose a repo-native adapter pattern. Always open the named files in this repo before implementing; do not rely on this summary alone.

Key paths in this repo:

- Helpers: `projects/helper/` (e.g. `sumTokens.js`, `unwrapLPs.js`, `staking.js`, `pool2.js`, `aave.js`, `compound.js`, `erc4626.js`, `cache.js`, `http.js`, `unknownTokens.js`)
- Registries: `registries/` (e.g. `aave.js`, `aaveV3.js`, `compound.js`, `erc4626.js`, `masterchef.js`, `stakingOnly.js`, `uniswapV2.js`, `uniswapV3.js`, `uniswapV3Graph.js`, `solanaStakePool.js`, `gmx.js`, `balancer.js`)
- Registry index: `registries/index.js`
- Whitelisted export keys: `projects/helper/whitelistedExportKeys.json`
- Test runner: `test.js`
- Project adapters: `projects/<protocol>/index.js` or `projects/<protocol>.js`
- Treasury and entity adapters: `projects/treasury/`, `projects/entities/`
- Non-EVM chain helpers: `projects/helper/chain/<chain>.js`, `projects/helper/solana.js`

## Runtime model

`test.js` loads an adapter module or falls back to `registries.allProtocols` for registry-backed entries. It rejects dead chains, validates chain names and export keys, rejects root-level export keys (`tvl`, `staking`, `pool2`, `borrowed`, `treasury`, `offers`, `vesting`), runs each chain bucket with `sdk.ChainApi`, prices balances, and fails when total `tvl` is missing.

Valid export keys come from `projects/helper/whitelistedExportKeys.json`: `tvl`, `staking`, `methodology`, `pool2`, `misrepresentedTokens`, `timetravel`, `borrowed`, `start`, `doublecounted`, `hallmarks`, `isHeavyProtocol`, `deadFrom`, `ownTokens`, `meta`, `moduleFilePath`, `vesting`.

## Pattern table

| Protocol shape | Use | Inspect before coding | Common mistakes |
| --- | --- | --- | --- |
| Simple owner/token balances | Custom `projects/<protocol>/index.js` with `sumTokensExport` or `sumTokens2` | `projects/helper/sumTokens.js`, `projects/helper/unwrapLPs.js`, an existing simple-balance adapter | Missing native token handling, wrong owner/token pairs, counting protocol-owned tokens as TVL |
| Staking or pool2 only | `registries/stakingOnly.js`, or `staking`/`pool2` exports in a custom adapter | `registries/stakingOnly.js`, `projects/helper/staking.js`, `projects/helper/pool2.js` | Counting staking as base `tvl`, omitting required empty `tvl` for staking-only registry pattern |
| ERC4626 vaults | `registries/erc4626.js` when a plain vault list fits | `registries/erc4626.js`, `projects/helper/erc4626.js` | Using custom code for plain vaults, forgetting `doublecounted` when vault assets are deployed into already-listed protocols |
| Uniswap V2/factory AMM | `registries/uniswapV2.js` when factory config fits | `registries/uniswapV2.js`, `projects/helper/unknownTokens.js` | Missing stable-pool options, wrong factory address, blacklisted tokens omitted |
| Uniswap V3/concentrated liquidity | `registries/uniswapV3.js` or `registries/uniswapV3Graph.js` | `registries/uniswapV3.js`, `registries/uniswapV3Graph.js`, `projects/helper/uniswapV3.js` | Missing `fromBlock`, wrong Algebra/Uniswap event shape, overusing `permitFailure` |
| Aave fork | `registries/aave.js` or `registries/aaveV3.js` | `registries/aave.js`, `registries/aaveV3.js`, `projects/helper/aave.js` | Counting debt as TVL, wrong registry/data helper, missing insolvent handling |
| Compound fork | `registries/compound.js` | `registries/compound.js`, `projects/helper/compound.js` | Not identifying cETH/native market, counting borrowed balances as TVL, missing blacklisted markets/tokens |
| MasterChef/farms | `registries/masterchef.js` when config fits | `registries/masterchef.js`, `projects/helper/masterchef.js`, `projects/helper/unknownTokens.js` | Misclassifying protocol-token farms, bad LP pricing for unknown tokens |
| API-assisted discovery, on-chain TVL | Custom adapter using `cache.js` / `http.js` for lists, then chain calls | `projects/helper/cache.js`, `projects/helper/http.js`, an existing adapter that discovers via API and measures on-chain | Returning API TVL directly, no fallback when the API is stale |
| Non-EVM balances | Chain-specific helpers via `projects/helper/sumTokens.js` | `projects/helper/sumTokens.js`, `projects/helper/chain/<chain>.js`, `projects/helper/solana.js` | EVM address assumptions, unsupported chain handler, token key format mistakes |
| Treasury or entity holdings | `projects/treasury/` or `projects/entities/` with treasury helpers | `projects/treasury/createDAO.js`, `projects/helper/treasury.js` | Mixing treasury holdings into protocol TVL, failing to separate `ownTokens` |
| Fetch/API-only TVL | Not allowed for new adapters | n/a | Returning `toUSDTBalances(apiTotal)` from a third-party TVL endpoint as the TVL value |

## Registry selection

Check `registries/index.js` for available registry families. A registry-backed adapter is appropriate when the protocol is a straightforward config instance of an existing family (Uniswap V2/V3, Aave, Compound, ERC4626, MasterChef, staking-only, Balancer, GMX, Solana stake pool).

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

`test.js` and PR CI catch invalid chain names, invalid export keys, missing total TVL, thrown runtime errors, stale or missing prices in output, unknown tokens in output, and package/lockfile changes (per `.github/workflows/test.yml`).

## What CI does not prove

Passing tests does not prove the methodology is correct, all assets are included, double-counting is handled, API discovery is complete, token pricing is economically sound, the PR template is complete, or the user has chosen the correct DefiLlama repo.
