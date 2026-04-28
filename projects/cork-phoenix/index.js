const { getLogs } = require('../helper/cache/getLogs')

// Cork Phoenix (v2) — rebuilt after the May 2025 exploit
// Docs: https://docs.cork.tech
// Contracts: https://github.com/Cork-Technology/phoenix/blob/main/config/prod.toml

const POOL_MANAGER = '0xccCCcCcCCccCfAE2Ee43F0E727A8c2969d74B9eC'
const FROM_BLOCK = 24238826

const marketCreatedAbi = 'event MarketCreated(bytes32 indexed poolId, address indexed referenceAsset, address indexed collateralAsset, uint256 expiry, address rateOracle, address principalToken, address swapToken)'
const assetsAbi = 'function assets(bytes32 poolId) external view returns (uint256 collateralAssets, uint256 referenceAssets)'

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: POOL_MANAGER,
    eventAbi: marketCreatedAbi,
    fromBlock: FROM_BLOCK,
    onlyArgs: true,
  })

  if (!logs.length) return {}

  const poolIds = logs.map(l => l.poolId)
  const collateralAssets = logs.map(l => l.collateralAsset)
  const referenceAssets = logs.map(l => l.referenceAsset)

  const assetAmounts = await api.multiCall({
    abi: assetsAbi,
    calls: poolIds.map(id => ({ target: POOL_MANAGER, params: [id] })),
  })

  assetAmounts.forEach((data, i) => {
    if (BigInt(data.collateralAssets) > 0n)
      api.add(collateralAssets[i], data.collateralAssets)
    if (BigInt(data.referenceAssets) > 0n)
      api.add(referenceAssets[i], data.referenceAssets)
  })
}

module.exports = {
  doublecounted: true,
  methodology: 'Sum of collateral assets and reference assets locked across all active Cork Phoenix pools. Collateral assets are deposited by liquidity providers; reference assets accumulate as cST holders exercise their swap rights.',
  hallmarks: [
    ['2025-05-28', 'Cork v1 exploit ($12M) — protocol rebuilt as Phoenix'],
  ],
  ethereum: { tvl },
}
// node test.js projects/cork-phoenix/index.js
