const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const kongEndpoint = 'https://kong.yearn.fi/api/rest'

const V3_STRATEGY_ABI = 'function strategies(address) view returns (uint256 activation, uint256 lastReport, uint256 currentDebt, uint256 maxDebt)'
const V2_STRATEGY_ABI = 'function strategies(address) view returns (uint256 performanceFee, uint256 activation, uint256 debtRatio, uint256 minDebtPerHarvest, uint256 maxDebtPerHarvest, uint256 lastReport, uint256 totalDebt, uint256 totalGain, uint256 totalLoss)'

// Yearn V2 vaults contain a MAXIMUM_STRATEGIES constant that Kong's strategiesCount can exceed, so cap at 20.
const MAX_V2_STRATEGIES = 20

// Cross-asset routes that can't be auto-detected, the strategy isn't a vault and the child asset differs.
const crossAssetNestedVaults = [
  { chainId: 1, parent: '0x028ec7330ff87667b6dfb0d94b954c820195336c', strategy: '0xaedf7d5f3112552e110e5f9d08c9997adce0b78d', child: '0x182863131f9a4630ff9e27830d945b1413e347e8' }, // DAI-1 -> (DAI/USDS) -> USDS-1
  { chainId: 1, parent: '0x028ec7330ff87667b6dfb0d94b954c820195336c', strategy: '0xff03dce6d95aa7a30b75efbafd11384221b9f9b5', child: '0xbe53a109b494e5c9f97b9cd39fe969be68bf6204' }, // DAI-1 -> (DAI/USDC) -> USDC-1
]

async function getDebts(api, activeVaults) {
  // get version from apiVersion instead of Kong's `v3` flag (some 3.x vaults are flagged v2).
  // V3 exposes get_default_queue(); V2 a slot-indexed withdrawalQueue.
  const withStrat = activeVaults.filter(({ vault }) => vault.strategiesCount > 0)
  const isV3 = ({ vault }) => (vault.apiVersion || '').startsWith('3')
  const v3 = withStrat.filter(isV3)
  const v2 = withStrat.filter(v => !isV3(v))

  // V3 exposes the whole queue in one call; V2 is slot-indexed, capped at MAX_V2_STRATEGIES
  const v3Queues = await api.multiCall({ abi: 'function get_default_queue() view returns (address[])', calls: v3.map(({ vault }) => vault.address) })
  const v2QueueCalls = []
  v2.forEach(({ vault }) => { for (let i = 0; i < Math.min(vault.strategiesCount, MAX_V2_STRATEGIES); i++) v2QueueCalls.push({ target: vault.address, params: [i] }) })
  const v2QueueRes = await api.multiCall({ abi: 'function withdrawalQueue(uint256) view returns (address)', calls: v2QueueCalls })

  const edges = []
  v3.forEach(({ vault }, i) => v3Queues[i].forEach(strategy => edges.push({ vault: vault.address, strategy, v3: true })))
  let slot = 0
  v2.forEach(({ vault }) => { for (let i = 0; i < Math.min(vault.strategiesCount, MAX_V2_STRATEGIES); i++) edges.push({ vault: vault.address, strategy: v2QueueRes[slot++], v3: false }) })

  const countedVaults = new Set(activeVaults.map(({ vault }) => vault.address.toLowerCase()))
  const crossAssetStrategies = new Set(crossAssetNestedVaults.map(e => e.strategy))
  const nested = edges.filter(e => e.strategy && (countedVaults.has(e.strategy.toLowerCase()) || crossAssetStrategies.has(e.strategy.toLowerCase())))

  // Per-strategy debt: V3 currentDebt, V2 totalDebt
  const v3Nested = nested.filter(e => e.v3)
  const v2Nested = nested.filter(e => !e.v3)
  const v3Debts = await api.multiCall({ abi: V3_STRATEGY_ABI, calls: v3Nested.map(e => ({ target: e.vault, params: [e.strategy] })) })
  const v2Debts = await api.multiCall({ abi: V2_STRATEGY_ABI, calls: v2Nested.map(e => ({ target: e.vault, params: [e.strategy] })) })
  v3Nested.forEach((e, i) => { e.currentDebt = v3Debts[i].currentDebt })
  v2Nested.forEach((e, i) => { e.currentDebt = v2Debts[i].totalDebt })

  const debtsByVault = new Map()
  for (const e of nested) {
    const list = debtsByVault.get(e.vault.toLowerCase()) ?? []
    list.push({ strategy: e.strategy, currentDebt: e.currentDebt })
    debtsByVault.set(e.vault.toLowerCase(), list)
  }
  return activeVaults.map(({ vault }) => ({ ...vault, debts: debtsByVault.get(vault.address.toLowerCase()) ?? [] }))
}

// Map each parent vault to the total debt it has deployed into other
// Yearn vaults. That amount is subtracted from the parent's own totalAssets.
function buildNestedDebtByVault(vaults) {
  const vaultByAddress = new Map(vaults.map(v => [v.address.toLowerCase(), v]))
  // Key by parent+strategy so reusing the same strategy contract from another
  // vault cannot accidentally activate a cross-asset deduction.
  const crossAssetEdgeByDebt = new Map(
    crossAssetNestedVaults.map(edge => [`${edge.chainId}:${edge.parent}:${edge.strategy}`, edge])
  )
  const nestedDebtByVault = new Map()

  for (const parent of vaults) {
    const parentAsset = parent.asset?.address?.toLowerCase()
    if (!parentAsset) continue

    for (const debt of parent.debts ?? []) {
      const strategy = debt.strategy?.toLowerCase()
      const crossAssetEdge = crossAssetEdgeByDebt.get(`${parent.chainId}:${parent.address.toLowerCase()}:${strategy}`)

      // Auto-detected: the strategy address is itself a counted same-asset vault.
      // Registered: an intermediary whose verified destination is a counted vault.
      const child = vaultByAddress.get(crossAssetEdge?.child ?? strategy)
      if (!child || child.chainId !== parent.chainId) continue
      const isSameAssetEdge = child.asset?.address?.toLowerCase() === parentAsset
      const isRegisteredCrossAssetEdge = crossAssetEdge?.child === child.address.toLowerCase()
      if (!isSameAssetEdge && !isRegisteredCrossAssetEdge) continue

      const currentDebt = BigInt(debt.currentDebt ?? 0)
      if (currentDebt <= 0n) continue

      const parentAddress = parent.address.toLowerCase()
      nestedDebtByVault.set(parentAddress, (nestedDebtByVault.get(parentAddress) ?? 0n) + currentDebt)
    }
  }

  return nestedDebtByVault
}

function subtractNestedDebt(totalAssets, nestedDebt = 0n) {
  const assets = BigInt(totalAssets)
  return assets > nestedDebt ? assets - nestedDebt : 0n
}

const v1Vaults = [
  '0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e',
  '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c',
  '0x37d19d1c4E1fa9DC47bD1eA12f742a0887eDa74a',
  '0xACd43E627e64355f1861cEC6d3a6688B31a6F952',
  '0x2f08119C6f07c006695E079AAFc638b8789FAf18',
  '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1',
  '0x2994529C0652D127b7842094103715ec5299bBed',
  '0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6',
  '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7',
  '0x9cA85572E6A3EbF24dEDd195623F188735A5179f',
  '0xec0d8D3ED5477106c6D4ea27D90a60e594693C90',
  '0x629c759D1E83eFbF63d84eb3868B564d9521C129',
  '0x0FCDAeDFb8A7DfDa2e9838564c5A1665d856AFDF',
  '0xcC7E70A958917cCe67B4B87a8C30E6297451aE98',
  '0x98B058b2CBacF5E99bC7012DF757ea7CFEbd35BC',
  '0xE0db48B4F71752C4bEf16De1DBD042B82976b8C7',
  '0x5334e150B938dd2b6bd040D9c4a03Cff0cED3765',
  '0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3',
  '0xF6C9E9AF314982A4b38366f4AbfAa00595C5A6fC',
  '0xA8B1Cb4ed612ee179BDeA16CCa6Ba596321AE52D',
  '0x46AFc2dfBd1ea0c0760CAD8262A5838e803A37e5',
  '0x5533ed0a3b83F70c3c4a1f69Ef5546D3D4713E44',
  '0x8e6741b456a074F0Bc45B8b82A755d4aF7E965dF',
  '0x03403154afc09Ce8e44C3B185C82C6aD5f86b9ab',
  '0xE625F5923303f1CE7A43ACFEFd11fd12f30DbcA4',
  '0xBacB69571323575C6a5A3b4F9EEde1DC7D31FBc1',
  '0x1B5eb1173D2Bf770e50F10410C9a96F7a8eB6e75',
  '0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6',
]
const blacklist = [
  '0xbD17B1ce622d73bD438b9E658acA5996dc394b0d',
  '0xc5bDdf9843308380375a611c18B50Fb9341f502A',
  '0x07FB4756f67bD46B748b16119E802F1f880fb2CC',
  '0x7F83935EcFe4729c4Ea592Ab2bC1A32588409797',
  '0x123964EbE096A920dae00Fb795FFBfA0c9Ff4675',
  '0x39546945695DCb1c037C836925B355262f551f55',
  '0x58900d761Ae3765B75DDFc235c1536B527F25d8F',
  // Katana pre-deposit vaults, which are part of the Katana bridge infrastructure.
  '0x7B5A0182E400b241b317e781a4e9dEdFc1429822',
  '0x48c03B6FfD0008460F8657Db1037C7e09dEedfcb',
  '0x92C82f5F771F6A44CfA09357DD0575B81BF5F728',
  '0xcc6a16Be713f6a714f68b0E1f4914fD3db15fBeF',
  // vaults below are currently tracked by yearn-curating
  '0xF470EB50B4a60c9b069F7Fd6032532B8F5cC014d',
  '0xA5DaB32DbE68E6fa784e1e50e4f620a0477D3896',
  '0xe1Ac97e2616Ad80f69f705ff007A4bbb3655544a',
  '0x77570CfEcf83bc6bB08E2cD9e8537aeA9F97eA2F',
  ...v1Vaults,
].map(i => i.toLowerCase())

async function tvl(api) {
  // Kong is Yearn's maintained indexer, replacing yDaemon. Its REST list is
  // chain-specific; balances and empty-vault filtering still come from on-chain
  // totalAssets calls below.
  const data = await getConfig(
    `yearn/vaults-${api.chainId}`,
    `${kongEndpoint}/list/vaults/${api.chainId}?origin=yearn`,
  )

  if (!Array.isArray(data))
    throw new Error('Invalid Kong response: expected vaults array')

  const candidates = data
    .filter(vault => vault.chainId === api.chainId)
    .filter(vault => !blacklist.includes(vault.address.toLowerCase()))
  const candidateCalls = candidates.map(vault => vault.address)
  const candidateBals = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: candidateCalls,
    permitFailure: true,
  })

  // Kong's priced TVL can be zero when an underlying asset has no price. Read
  // every candidate on-chain and discard only vaults with no assets.
  const activeVaults = candidates
    .map((vault, i) => ({ vault, balance: candidateBals[i] }))
    .filter(({ balance }) => BigInt(balance ?? 0) > 0n)
  // Read each active vault's strategy list and per-strategy debt on-chain to prevent
  // capital allocated to another Yearn vault from being counted in both the parent and child.
  const vaults = await getDebts(api, activeVaults)
  const bals = activeVaults.map(({ balance }) => balance)
  const calls = vaults.map(vault => vault.address)

  // Debt a vault has deployed into other Yearn vaults, keyed by that vault. It
  // is subtracted from the vault's own totalAssets (in its own asset), so the
  // child keeps its full real balance and no token conversion is needed.
  const nestedDebtByVault = buildNestedDebtByVault(vaults)

  // V2 vaults expose token(), while ERC-4626/V3 vaults expose asset(). Trying
  // both lets the same loop cover both generations.
  const tokens = await api.multiCall({ abi: 'address:token', calls, permitFailure: true })

  const tokensAlt = await api.multiCall({ abi: 'address:asset', calls, permitFailure: true })
  bals.forEach((bal, i) => {
    const token = tokens[i] || tokensAlt[i]
    const nestedDebt = nestedDebtByVault.get(vaults[i].address.toLowerCase())

    // Remove the portion this vault has deployed into other counted vaults,
    // leaving only what it holds independently (idle + non-nested strategies).
    const adjustedBalance = subtractNestedDebt(bal, nestedDebt)
    if (token && adjustedBalance > 0n) api.add(token, adjustedBalance)
  })

  // V1 predates totalAssets/ERC-4626. It is excluded from the Kong loop through
  // the blacklist and valued separately as totalSupply * pricePerShare.
  if (api.chain === 'ethereum') {
    const tokens = await api.multiCall({ abi: 'address:token', calls: v1Vaults })
    let bals = await api.multiCall({ abi: 'erc20:totalSupply', calls: v1Vaults })
    const ratio = await api.multiCall({ abi: 'uint256:getPricePerFullShare', calls: v1Vaults })
    bals = bals.map((bal, i) => bal * ratio[i] / 1e18)
    api.addTokens(tokens, bals)
  }

  // Resolve LP-like vault assets after all adjusted balances have been added.
  return sumTokens2({ api, resolveLP: api.chain !== 'ethereum' })
}


module.exports = {
  doublecounted: true,
  timetravel: false,
  hallmarks: [
    ['2020-07-17', "YFI token Launch"],
  ]
}

const chains = ['ethereum', 'fantom', 'arbitrum', 'optimism', 'polygon', 'base', 'katana']

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
