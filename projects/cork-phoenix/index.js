const { getLogs } = require('../helper/cache/getLogs')

// Cork Phoenix (v2) — rebuilt after the May 2025 exploit
// Docs: https://docs.cork.tech
// Contracts: https://github.com/Cork-Technology/phoenix/blob/main/config/prod.toml

const POOL_MANAGER = '0xccCCcCcCCccCfAE2Ee43F0E727A8c2969d74B9eC'
const FROM_BLOCK = 24238826 // history_last_deployment_block (mainnet)

// MarketId is bytes32 — emitted on every new pool creation
const marketCreatedAbi = 'event MarketCreated(bytes32 indexed poolId, address indexed referenceAsset, address indexed collateralAsset, uint256 expiry, address rateOracle, address principalToken, address swapToken)'

// Returns amounts of CA and REF currently locked in each pool
const assetsAbi = 'function assets(bytes32 poolId) external view returns (uint256 collateralAssets, uint256 referenceAssets)'

async function tvl(api) {
  // Discover all pools via MarketCreated events
  const logs = await getLogs({
    api,
    target: POOL_MANAGER,
    eventAbi: marketCreatedAbi,
    fromBlock: FROM_BLOCK,
    onlyArgs: true,
  })

  if (!logs.length) return {}

  // Each log gives us poolId (bytes32), collateralAsset, referenceAsset
  const poolIds = logs.map(l => l.poolId)

  // Query locked amounts per pool — pattern: calls = array of single-arg values
  const assetAmounts = await api.multiCall({
    abi: assetsAbi,
    target: POOL_MANAGER,
    calls: poolIds,
  })

  // Accumulate balances — named destructuring matches string ABI return names
  assetAmounts.forEach(({ collateralAssets, referenceAssets }, i) => {
    api.add(logs[i].collateralAsset, collateralAssets)
    api.add(logs[i].referenceAsset, referenceAssets)
  })
}

module.exports = {
  doublecounted: true,
  methodology: 'Sum of collateral assets (deposited by LPs) and reference assets (accumulated via cST exercise) locked across all Cork Phoenix pools on the CorkPoolManager contract.',
  hallmarks: [
    ['2025-05-28', 'Cork v1 exploit ($12M) — protocol rebuilt as Phoenix'],
  ],
  ethereum: { tvl },
}
// node test.js projects/cork-phoenix/index.js
