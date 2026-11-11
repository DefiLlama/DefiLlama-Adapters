const { batchCall, enumerateArray, getV2Pools, getV3Pools, lc } = require('../helper/chain/strato')
const { sumTokens2 } = require('../helper/unwrapLPs')

const CDP_REGISTRY     = '0x0000000000000000000000000000000000001012'
const LENDING_REGISTRY = '0x0000000000000000000000000000000000001007'
const LENDING_POOL     = '0x0000000000000000000000000000000000001005'
const SAFETY_MODULE    = '0x0000000000000000000000000000000000001015'
const SAVE_USDST_VAULT = '0x22550671fcad04a213697ac7ae4f4366e96446ed'
const VAULT            = '0x34bc729f66106a146b0864e673a3571b28fa23e1'
const STRATO_STAKING   = '0xf30a022ce83bed7adeafc286c719388dcc3b3988'
// $STRATO, native to the STRATO chain. Priced via helper/tokenMapping (`ethereum-strato`).
const STRATO_TOKEN     = '0x2ca3e170e6714282da77815f7864b17f612f5f83'
// DirectMintPSM: mints USDST 1:1 against stablecoin reserves it holds.
const DIRECT_MINT_PSM  = '0xb1efdc86eecfbedf83d0295671214fee451786f3'
// ERC-4626 YieldVaults. There is no on-chain factory/registry to enumerate
// them, so initialized vaults are listed explicitly. `asset()` is read on-chain.
const YIELD_VAULTS = [
  '0xafcfc4d847d59fbc402856fd6934aff6796812b1', // yieldUSDC
  '0xa94905d8bd117e9bfbe57aadffd7abbea760e028', // carryETH
  '0x0b5831edcab6f06256a790340426236c31bb463f', // carryWBTC
  '0xddf7c27f27ac43b25043e100c2076e515526b9ae', // yieldGOLDST
  '0xf8884c44d7cfbfb7c6326c515f375f8572f03e2b', // yieldSILVST
]

const RAY = 10n ** 27n

async function tvl(api) {
  // Swap pool liquidity is listed separately (strato-dex). The pools are still enumerated here only
  // as the token universe to probe the CDP vault and PSM with: neither holder enumerates its assets.
  const pools = [...await getV2Pools(), ...await getV3Pools()]

  const [cdpVault, collateralVault, liquidityPool, borrowableAsset, vaultBotExecutor, saveAsset, safetyAsset, usdst, saveTotalAssets, safetyTotalAssets, ...yieldVaultAssets] = await batchCall([
    { target: CDP_REGISTRY,     abi: 'function cdpVault() view returns (address)' },
    { target: LENDING_REGISTRY, abi: 'function collateralVault() view returns (address)' },
    { target: LENDING_REGISTRY, abi: 'function liquidityPool() view returns (address)' },
    { target: LENDING_POOL,     abi: 'function borrowableAsset() view returns (address)' },
    { target: VAULT,            abi: 'function botExecutor() view returns (address)' },
    { target: SAVE_USDST_VAULT, abi: 'function asset() view returns (address)' },
    { target: SAFETY_MODULE,    abi: 'function asset() view returns (address)' },
    { target: CDP_REGISTRY,     abi: 'function usdst() view returns (address)' },
    { target: SAVE_USDST_VAULT, abi: 'function totalAssets() view returns (uint256)' },
    { target: SAFETY_MODULE,    abi: 'function totalAssets() view returns (uint256)' },
    ...YIELD_VAULTS.map((target) => ({ target, abi: 'function asset() view returns (address)' })),
  ]).then((res) => res.map((r) => typeof r === 'string' ? lc(r) : r))
  const lendingCollateralTokens = await enumerateArray(LENDING_POOL, 'function configuredAssets(uint256) view returns (address)')
  const vaultAssets             = await enumerateArray(VAULT, 'function supportedAssets(uint256) view returns (address)')

  const tokenSet = new Set()
  pools.forEach(p => p.tokens.forEach(t => tokenSet.add(t)))
  lendingCollateralTokens.forEach(t => tokenSet.add(t))
  vaultAssets.forEach(t => tokenSet.add(t))
  tokenSet.add(borrowableAsset)
  tokenSet.add(saveAsset)
  tokenSet.add(safetyAsset)
  const allTokens = [...tokenSet]

  const pairs = []
  for (const token of allTokens) pairs.push({ holder: cdpVault, token })
  for (const token of lendingCollateralTokens) pairs.push({ holder: collateralVault, token })
  pairs.push({ holder: liquidityPool, token: borrowableAsset })
  for (const token of vaultAssets) pairs.push({ holder: vaultBotExecutor, token })

  // PSM reserves. Accepted tokens live in a non-enumerable mapping, so check
  // every token the adapter already knows about.
  for (const token of allTokens) pairs.push({ holder: DIRECT_MINT_PSM, token })

  // YieldVaults: count only assets idle in the vault contract. `deployedAssets`
  // is capital handed to strategy wallets that redeploy it into CDPs / pools on
  // STRATO, where it is already counted above. Counting it here would double count.
  YIELD_VAULTS.forEach((vault, i) => pairs.push({ holder: vault, token: yieldVaultAssets[i] }))

  const balances = await batchCall(pairs.map(({ token, holder }) => ({ target: token, abi: 'function balanceOf(address) view returns (uint256)', params: [holder] })))
  pairs.forEach(({ token }, i) => { if (balances[i] > 0n) api.add(token, balances[i].toString()) })

  if (saveTotalAssets   > 0n) api.add(saveAsset,   saveTotalAssets.toString())
  if (safetyTotalAssets > 0n) api.add(safetyAsset, safetyTotalAssets.toString())

  // USDST is issued against CDP collateral / PSM reserves already counted above.
  api.removeTokenBalance(usdst)
  // $STRATO is the protocol's own token: reported under `staking`, not TVL.
  api.removeTokenBalance(STRATO_TOKEN)
}

async function borrowed(api) {
  const [borrowableAsset, borrowIndex, totalScaledDebt, cdpEngine, usdst] = await batchCall([
    { target: LENDING_POOL, abi: 'function borrowableAsset() view returns (address)' },
    { target: LENDING_POOL, abi: 'function borrowIndex() view returns (uint256)' },
    { target: LENDING_POOL, abi: 'function totalScaledDebt() view returns (uint256)' },
    { target: CDP_REGISTRY, abi: 'function cdpEngine() view returns (address)' },
    { target: CDP_REGISTRY, abi: 'function usdst() view returns (address)' },
  ])

  const lendingDebt = (totalScaledDebt * borrowIndex) / RAY
  if (lendingDebt > 0n) api.add(borrowableAsset, lendingDebt.toString())

  // CDP debt. `totalDebtAll` sums outstanding USDST across every enumerated
  // collateral asset, using the stored rateAccumulator so the call has no accrual
  // side effects. Returns WAD (18 decimals), matching USDST.
  const [cdpDebt] = await batchCall([{ target: cdpEngine, abi: 'function totalDebtAll() view returns (uint256)' }])
  if (cdpDebt > 0n) api.add(usdst, cdpDebt.toString())
}

// Phase 1 $STRATO staking. There is no receipt token; stake is tracked as
// internal accounting on StratoStaking. Principal = delegated user stake +
// operator self-bond. Unbonding stake and the reward reserve are excluded.
async function staking(api) {
  const [totalUserStake, totalSelfBond] = await batchCall([
    { target: STRATO_STAKING, abi: 'function totalUserStake() view returns (uint256)' },
    { target: STRATO_STAKING, abi: 'function totalSelfBond() view returns (uint256)' },
  ])
  const staked = totalUserStake + totalSelfBond
  if (staked > 0n) api.add(STRATO_TOKEN, staked.toString())
  return sumTokens2({ api })
}

module.exports = {
  methodology:
    'All values verified on-chain via batched eth_call (no Multicall3). CDP collateral read from CDPVault, lending deposits (idle liquidity + collateral) from LiquidityPool + CollateralVault, savings from SaveUSDSTVault, staked assets from SafetyModule, vault holdings from the Vault botExecutor, stablecoin reserves held by the DirectMintPSM, and idle assets held by each ERC-4626 YieldVault (capital deployed to strategies is excluded because it is redeployed into CDPs/pools already counted). Swap pool liquidity (PoolFactory / PoolV3Factory) is listed separately as STRATO DEX. USDST is excluded from base TVL across all holders because its backing CDP collateral and PSM reserves are already counted. Holder addresses resolved from on-chain registries (CDPRegistry, LendingRegistry). Outstanding debt is reported separately under `borrowed` and excluded from TVL: LiquidityPool debt (totalScaledDebt × borrowIndex / RAY against the LiquidityPool borrowableAsset) plus CDP debt (CDPEngine.totalDebtAll, outstanding USDST summed across every enumerated collateral asset). Staked $STRATO (StratoStaking totalUserStake + totalSelfBond) is reported under `staking` and excluded from base TVL. Prices resolved server-side by DefiLlama for the `strato` chain.',
  timetravel: false,
  start: '2026-04-02',
  strato: { tvl, borrowed, staking },
}
