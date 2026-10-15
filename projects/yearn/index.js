const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const sdk = require('@defillama/sdk')

const kongEndpoint = 'https://kong.yearn.fi/api/rest'

const V3_STRATEGY_ABI = 'function strategies(address) view returns (uint256 activation, uint256 lastReport, uint256 currentDebt, uint256 maxDebt)'
const V2_STRATEGY_ABI = 'function strategies(address) view returns (uint256 performanceFee, uint256 activation, uint256 debtRatio, uint256 minDebtPerHarvest, uint256 maxDebtPerHarvest, uint256 lastReport, uint256 totalDebt, uint256 totalGain, uint256 totalLoss)'

// Yearn V2 vaults contain a MAXIMUM_STRATEGIES constant that Kong's strategiesCount can exceed, so cap at 20.
const MAX_V2_STRATEGIES = 20

// Registered intermediary routes: the strategy address differs from its child vault.
// Parent-scoped mappings avoid treating a reused strategy as an unrelated vault's
// allocation. Recheck destination getters and cap deductions by actual holdings.
// Include zero-debt converters too: DAI-2 -> Yearn Term USDS and yvUSD -> Spark
// USDS can receive allocations later. Term USDS resolves to 0xe852..., not USDS-1.
// If that destination is absent from the counted inventory, do not deduct it.
// The two DAI-1 routes at the end were already handled by the upstream adapter.
const registeredNestedVaults = [
  { chainId: 1, parent: '0x132d8d2c76db3812403431facb00f3453fc42125', strategy: '0x901fe4d83c5475bf9bdbcf0dc2574d5db1ca9cda', child: '0x774b4cbc2703ce83fb3b828b7c782d1cd983b04a', getter: 'yVault' },
  { chainId: 1, parent: '0x1635b506a88fbf428465ad65d00e8d6b6e5846c3', strategy: '0xdd38062704b09b897fd8ad652ce8294985fb3d33', child: '0x75a291f0232add37d72dd1dcff55b715755ecdee', getter: 'yVault' },
  { chainId: 1, parent: '0x19d3364a399d251e894ac732651be8b0e4e85001', strategy: '0x3d6532c589a11117a4494d9725bb8518c731f1be', child: '0xda816459f1ab5631232fe5e97a05bbbb94970c95', getter: 'yVault' },
  { chainId: 1, parent: '0x2a38b9b0201ca39b17b460ed2f11e4929559071e', strategy: '0x7320541570ad6fec3ebc67685268948a50d4cb48', child: '0x63bd3bbb6c5cb6e457c3f3cbb2d8aa2536e319f1', getter: 'yVault' },
  { chainId: 1, parent: '0x2dfb14e32e2f8156ec15a2c21c3a6c053af52be8', strategy: '0x47128518d9cad921af60ed42568a69781d710cd5', child: '0xa540744dedbda9ef64cf753f0e851efe4a419ea9', getter: 'yVault' },
  { chainId: 1, parent: '0x3b27f92c0e212c671ea351827edf93db27cc0c65', strategy: '0xe07d1e27d93eda41ab091fc91a2026df41763b56', child: '0x310b7ea7475a0b449cfd73be81522f1b88efafaa', getter: 'yVault' },
  { chainId: 1, parent: '0x5f18c75abdae578b483e5f43f12a39cf75b973a9', strategy: '0x36822d0b11f4594380181ce6e76bd4986d46c389', child: '0xa354f35829ae975e850e23e9615b11da1b3dc4de', getter: 'yVault' },
  { chainId: 1, parent: '0x5fa5b62c8af877cb37031e0a3b2f34a78e3c56a6', strategy: '0x343a52634b2464a87146c44ed8005577937f885c', child: '0xad86df2e8f989c828b25a7da5eb1ec363283fa3f', getter: 'yVault' },
  { chainId: 1, parent: '0x7da96a3891add058ada2e826306d812c638d87a7', strategy: '0xb0eb24077563db8b88384949011dc46410c0a31d', child: '0x3b27f92c0e212c671ea351827edf93db27cc0c65', getter: 'yVault' },
  { chainId: 1, parent: '0x8cc94ccd0f3841a468184aca3cc478d2148e1757', strategy: '0x199cffcc256d4195a81b10eb7695bf02d43e3b02', child: '0x944d749017053e0d37ec206c9898716a21e0b2e2', getter: 'yVault' },
  { chainId: 1, parent: '0xa258c4606ca8206d8aa700ce2143d7db854d168c', strategy: '0x85907b1af27fd04a5efabc0fb7162f8690a6b82f', child: '0xc56413869c6cdf96496f2b1ef801fedbdfa7ddb0', getter: 'yVault' },
  { chainId: 1, parent: '0xa354f35829ae975e850e23e9615b11da1b3dc4de', strategy: '0xd5aadcd054a00eff71bcb922cddc70752fa2bc68', child: '0xbe53a109b494e5c9f97b9cd39fe969be68bf6204', getter: 'yVault' },
  { chainId: 1, parent: '0xa696a63cc78dffa1a63e9e50587c197387ff6c7e', strategy: '0x8b64692c42ac08a7275aff3e2cc59e7401c471d5', child: '0x751f0cc6115410a3ee9ec92d08f46ff6da98b708', getter: 'yVault' },
  { chainId: 1, parent: '0xa74d4b67b3368e83797a35382afb776baae4f5c8', strategy: '0x85b360dee557135d8903225939699dd644d33cb8', child: '0x4cbb6a5ec00ceec252a7091559484f7adb83165f', getter: 'yVault' },
  { chainId: 1, parent: '0xa9fe4601811213c340e850ea305481aff02f5b28', strategy: '0xe5f7f2e59b259e11ecf2ff76fdf5dc7438363a3f', child: '0xa258c4606ca8206d8aa700ce2143d7db854d168c', getter: 'yVault' },
  { chainId: 1, parent: '0xb4ada607b9d6b2c9ee07a275e9616b84ac560139', strategy: '0xaad21781fe48048264d89da52423097e4397ff36', child: '0xb37094c1b5614bd6ece40afb295c26f4377069d3', getter: 'yVault' },
  { chainId: 1, parent: '0xbe53a109b494e5c9f97b9cd39fe969be68bf6204', strategy: '0x39c0aec5738ed939876245224afc7e09c8480a52', child: '0x182863131f9a4630ff9e27830d945b1413e347e8', getter: 'vault', parentAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', childAsset: '0xdc035d45d973e3ec169d2276ddab16f1e407384f', parentDecimals: 6, childDecimals: 18 },
  { chainId: 1, parent: '0xbfedbcbe27171c418cdabc2477042554b1904857', strategy: '0xa7074434aa4419ed18f220152bcaa989b3b9d8c1', child: '0x77e829fff18c14ad9bb88963acb0010a0506de88', getter: 'yVault' },
  { chainId: 1, parent: '0xd6ea40597be05c201845c0bfd2e96a60bacde267', strategy: '0xb2f45226d0b1ebe7ce3c7b0a53eb4a82e032060d', child: '0xae6ed98b1bd9aadd3185160324e0e011159b61d3', getter: 'yVault' },
  { chainId: 1, parent: '0xda816459f1ab5631232fe5e97a05bbbb94970c95', strategy: '0xa7496763f035e73ec6b56f4c86312cc1874a01e3', child: '0x028ec7330ff87667b6dfb0d94b954c820195336c', getter: 'yVault' },
  { chainId: 1, parent: '0xdcd90c7f6324cfa40d7169ef80b12031770b4325', strategy: '0x9084b5a98e3b4b257affd82ae4a1753f87906dce', child: '0x5b8c556b8b2a78696f0b9b830b3d67623122e270', getter: 'yVault' },
  { chainId: 1, parent: '0xe14d13d8b3b85af791b2aadd661cdbd5e6097db1', strategy: '0x0a5157244e4f82f100a461ca65c7b05c8dacf835', child: '0xdb25ca703181e7484a155dd612b06f57e12be5f0', getter: 'yVault' },
  { chainId: 1, parent: '0xe537b5cc158eb71037d4125bdd7538421981e6aa', strategy: '0x906a5fb545d177ba441a57b3a24eaeda555d29e3', child: '0x8078198fc424986ae89ce4a910fc109587b6abf3', getter: 'yVault' },
  { chainId: 1, parent: '0x92545bce636e6ee91d88d2d017182cd0bd2fc22e', strategy: '0x6164217caa4ff58fb722d726391875ac0c5fb541', child: '0xe852db931ac6f02490a32695f09ee79a31f53821', getter: 'vault', parentAsset: '0x6b175474e89094c44da98b954eedeac495271d0f', childAsset: '0xdc035d45d973e3ec169d2276ddab16f1e407384f', parentDecimals: 18, childDecimals: 18 },
  { chainId: 1, parent: '0x696d02db93291651ed510704c9b286841d506987', strategy: '0x9e0a5943dfc1a85b48c191aa7c10487297aa675b', child: '0xc9f01b5c6048b064e6d925d1c2d7206d4feef8a3', getter: 'vault', parentAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', childAsset: '0xdc035d45d973e3ec169d2276ddab16f1e407384f', parentDecimals: 6, childDecimals: 18 },
  { chainId: 1, parent: '0x028ec7330ff87667b6dfb0d94b954c820195336c', strategy: '0xaedf7d5f3112552e110e5f9d08c9997adce0b78d', child: '0x182863131f9a4630ff9e27830d945b1413e347e8' }, // DAI-1 -> (DAI/USDS) -> USDS-1
  { chainId: 1, parent: '0x028ec7330ff87667b6dfb0d94b954c820195336c', strategy: '0xff03dce6d95aa7a30b75efbafd11384221b9f9b5', child: '0xbe53a109b494e5c9f97b9cd39fe969be68bf6204' }, // DAI-1 -> (DAI/USDC) -> USDC-1
]

// The Ethereum sender's USDC debt backs vbUSDC deposited in Katana. Confirm
// reciprocal counterparts and the counted destination before removing anything.
// Both assets use six decimals; cap the deduction by debt and remote ownership.
async function remoteOverlap(api, vaults, strategyAbi) {
  const parent = '0x696d02db93291651ed510704c9b286841d506987'
  const strategy = '0xc5b16e7efe1ca05714477b8edcab4dee9b93a27c'
  const holder = '0xefeebaacdc5640a123fe282652503ea4fd499d14'
  const child = '0x80c34bd3a3569e126e7055831036aa7b212cb159'

  if (api.chainId !== 1 || !vaults.some(v => v.address.toLowerCase() === parent)) return new Map()
  const remote = new sdk.ChainApi({ chain: 'katana', timestamp: api.timestamp })
  const inventory = await getConfig('yearn/vaults-747474', 'https://kong.yearn.fi/api/rest/list/vaults/747474?origin=yearn')
  if (!inventory.some(v => v.chainId === 747474 && v.address.toLowerCase() === child)) return new Map()
  const chain = await api.call({ target: strategy, abi: 'uint256:REMOTE_CHAIN_ID' })
  const counterpart = await api.call({ target: strategy, abi: 'address:REMOTE_COUNTERPART' })
  const reverse = await remote.call({ target: holder, abi: 'address:REMOTE_COUNTERPART' })
  const destination = await remote.call({ target: holder, abi: 'address:vault' })
  const asset = await api.call({ target: parent, abi: 'address:asset' })
  const remoteAsset = await remote.call({ target: child, abi: 'address:asset' })
  if (Number(chain) !== 747474 || counterpart.toLowerCase() !== holder ||
      reverse.toLowerCase() !== strategy || destination.toLowerCase() !== child ||
      asset.toLowerCase() !== '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' ||
      remoteAsset.toLowerCase() !== '0x203a662b0bd271a6ed5a60edfbd04bfce608fd36')
    throw new Error('Yearn Katana overlap route changed')
  const debt = await api.call({ target: parent, abi: strategyAbi, params: [strategy] })
  const shares = BigInt(await remote.call({ target: child, abi: 'erc20:balanceOf', params: [holder] }))
  const supply = BigInt(await remote.call({ target: child, abi: 'erc20:totalSupply' }))
  const assets = BigInt(await remote.call({ target: child, abi: 'uint256:totalAssets' }))
  if (shares > supply) throw new Error('Invalid Yearn remote ownership')
  const owned = supply ? assets * shares / supply : 0n
  const countedSender = vaults.some(v => v.address.toLowerCase() === strategy)
  const owed = countedSender
    ? BigInt(await api.call({ target: strategy, abi: 'uint256:totalAssets' }))
    : BigInt(debt.currentDebt)
  return new Map([[countedSender ? strategy : parent, owned < owed ? owned : owed]])
}

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

  const registered = registeredNestedVaults.filter(route =>
    route.chainId === api.chainId && route.getter &&
    edges.some(edge => edge.vault.toLowerCase() === route.parent && edge.strategy?.toLowerCase() === route.strategy) &&
    activeVaults.some(({ vault }) => vault.address.toLowerCase() === route.child))
  await Promise.all([...new Set(registered.map(route => route.getter))].map(async getter => {
    const routes = registered.filter(route => route.getter === getter)
    const destinations = await api.multiCall({ abi: `address:${getter}`, calls: routes.map(route => route.strategy) })
    routes.forEach((route, i) => {
      if (destinations[i].toLowerCase() !== route.child) throw new Error(`Yearn router destination changed: ${route.strategy}`)
    })
  }))

  const countedVaults = new Set(activeVaults.map(({ vault }) => vault.address.toLowerCase()))
  const crossAssetStrategies = new Set(registeredNestedVaults.map(e => e.strategy))
  const nested = edges.filter(e => e.strategy && (countedVaults.has(e.strategy.toLowerCase()) || crossAssetStrategies.has(e.strategy.toLowerCase())))

  // Per-strategy debt: V3 currentDebt, V2 totalDebt
  const v3Nested = nested.filter(e => e.v3)
  const v2Nested = nested.filter(e => !e.v3)
  const v3Debts = await api.multiCall({ abi: V3_STRATEGY_ABI, calls: v3Nested.map(e => ({ target: e.vault, params: [e.strategy] })) })
  const v2Debts = await api.multiCall({ abi: V2_STRATEGY_ABI, calls: v2Nested.map(e => ({ target: e.vault, params: [e.strategy] })) })
  v3Nested.forEach((e, i) => { e.currentDebt = v3Debts[i].currentDebt })
  v2Nested.forEach((e, i) => { e.currentDebt = v2Debts[i].totalDebt })

  const routes = registeredNestedVaults.filter(route => route.getter)
  const mapped = nested.map(edge => ({
    edge,
    route: routes.find(route => route.chainId === api.chainId &&
      route.parent === edge.vault.toLowerCase() && route.strategy === edge.strategy.toLowerCase()),
  })).filter(({ route }) => route && countedVaults.has(route.child))
  const shares = await api.multiCall({ abi: 'erc20:balanceOf', calls: mapped.map(({ edge, route }) => ({ target: route.child, params: [edge.strategy] })) })
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: mapped.map(({ route }) => route.child) })
  mapped.forEach(({ edge, route }, i) => {
    const child = activeVaults.find(({ vault }) => vault.address.toLowerCase() === route.child)
    const supply = BigInt(supplies[i]), held = BigInt(shares[i])
    if (held > supply) throw new Error('Invalid Yearn router ownership')
    let owned = supply ? BigInt(child.balance) * held / supply : 0n
    const parent = activeVaults.find(({ vault }) => vault.address.toLowerCase() === route.parent)
    const parentAsset = parent.vault.asset.address.toLowerCase(), childAsset = child.vault.asset.address.toLowerCase()
    // Registered converters exchange DAI/USDC/USDS at 1:1. Normalize the
    // child's raw asset units into parent units; do not assume equal decimals.
    if (route.parentAsset) {
      if (parentAsset !== route.parentAsset || childAsset !== route.childAsset) throw new Error('Yearn converter asset changed')
      owned = owned * 10n ** BigInt(route.parentDecimals) / 10n ** BigInt(route.childDecimals)
    } else if (parentAsset !== childAsset) throw new Error('Yearn router asset changed')
    if (owned < BigInt(edge.currentDebt)) edge.currentDebt = owned.toString()
  })

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
    registeredNestedVaults.map(edge => [`${edge.chainId}:${edge.parent}:${edge.strategy}`, edge])
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
  for (const [parent, debt] of await remoteOverlap(api, vaults, V3_STRATEGY_ABI))
    nestedDebtByVault.set(parent, (nestedDebtByVault.get(parent) ?? 0n) + debt)

  // V2 vaults expose token(), while ERC-4626/V3 vaults expose asset(). Trying
  // both lets the same loop cover both generations.
  const tokens = await api.multiCall({ abi: 'address:token', calls, permitFailure: true })

  const tokensAlt = await api.multiCall({ abi: 'address:asset', calls, permitFailure: true })
  const countedVaults = new Set(calls.filter((_, i) => tokens[i] || tokensAlt[i]).map(address => address.toLowerCase()))
  bals.forEach((bal, i) => {
    const token = tokens[i] || tokensAlt[i]
    // A wrapper's assets are shares in another counted vault. The underlying
    // vault already includes all of these assets, including deployed shares.
    if (token && token.toLowerCase() !== calls[i].toLowerCase() && countedVaults.has(token.toLowerCase())) return
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
