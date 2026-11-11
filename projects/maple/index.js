const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')
const { post } = require('../helper/http')
const { sumTokens } = require('../helper/sumTokens')

const stSYRUP = '0xc7E8b36E0766D9B04c93De68A9D47dD11f260B45'
const PYUSD = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'
// fixed-term and open-term loan manager factories, every other pool strategy deploys idle cash
const LOAN_MANAGER_FACTORIES = ['0x1551717AE4FdCB65ed028F7fB7abA39908f6A7A6', '0x90b14505221a24039A2D11Ad5862339db97Cc160'].map(a => a.toLowerCase())

const POOLS_QUERY = `{
  poolV2S(first: 1000) {
    id
    name
    collateralValue
    asset { id }
    poolManager { id }
    loanManager { id }
    openTermLoanManager { id }
    poolMeta { poolCollaterals { addresses asset blockchain assetAmount } }
  }
}`

const LOANS_QUERY = (skip) => `{ openTermLoans(first: 1000, skip: ${skip}) { id fundingPool { id } loanMeta { type } } }`

// keyed by poolCollaterals `blockchain:asset`, tokens are only needed on EVM chains
const COLLATERALS = {
  'Bitcoin:BTC': { chain: 'bitcoin' },
  'XRP:XRP': { chain: 'ripple' },
  // ETH collateral is also held as wstETH at the custody addresses
  'Ethereum:ETH': { chain: 'ethereum', tokens: [ADDRESSES.null, ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.WSTETH] },
  // USDC collateral is also held as PYUSD at the custody addresses
  'Ethereum:USDC': { chain: 'ethereum', tokens: [ADDRESSES.ethereum.USDC, PYUSD] },
  'Ethereum:WBTC': { chain: 'ethereum', tokens: [ADDRESSES.ethereum.WBTC] },
  'Ethereum:cbBTC': { chain: 'ethereum', tokens: [ADDRESSES.ethereum.cbBTC] },
  'Ethereum:LBTC': { chain: 'ethereum', tokens: [ADDRESSES.ethereum.LBTC] },
  'Ethereum:USDT': { chain: 'ethereum', tokens: [ADDRESSES.ethereum.USDT] },
  'Ethereum:USDG': { chain: 'ethereum', tokens: [ADDRESSES.ethereum.USDG] },
  'Ethereum:sUSDS': { chain: 'ethereum', tokens: [ADDRESSES.ethereum.sUSDS] },
  'Ethereum:USTB': { chain: 'ethereum', tokens: ['0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e'] },
  'Ethereum:USDtb': { chain: 'ethereum', tokens: ['0xC139190F447e929f090Edeb554D95AbB8b18aC1C'] },
  'Ethereum:weETH': { chain: 'ethereum', tokens: [ADDRESSES.ethereum.WEETH] },
  'Ethereum:tETH': { chain: 'ethereum', tokens: ['0xD11c452fc99cF405034ee446803b6F6c1F6d5ED8'] },
  'Ethereum:USR': { chain: 'ethereum', tokens: ['0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110'] },
  'Ethereum:ATH': { chain: 'ethereum', tokens: ['0xbe0Ed4138121EcFC5c0E56B40517da27E6c5226B'] },
}

async function getPools() {
  const { poolV2S: pools } = await getConfig('maple/pools-v2', undefined, {
    fetcher: async () => {
      const { data, errors } = await post('https://api.maple.finance/v2/graphql', { query: POOLS_QUERY })
      if (errors?.length || !data?.poolV2S?.length) throw new Error('Maple: invalid poolV2S response')
      return data
    },
  })
  if (!pools?.length) throw new Error('Maple: no pools')
  return pools
}

// open-term loans Maple labels (amm, defi, intercompany, strategy, tBills, termBasis...) deploy pool cash and are not loans to borrowers
async function getLabelledLoans() {
  const { loans } = await getConfig('maple/labelled-open-term-loans', undefined, {
    fetcher: async () => {
      const loans = []
      for (let skip = 0; ; skip += 1000) {
        const { data, errors } = await post('https://api.maple.finance/v2/graphql', { query: LOANS_QUERY(skip) })
        if (errors?.length || !data?.openTermLoans) throw new Error('Maple: invalid openTermLoans response')
        loans.push(...data.openTermLoans)
        if (data.openTermLoans.length < 1000) break
      }
      if (!loans.length) throw new Error('Maple: no open-term loans')
      return { loans: loans.filter(l => l.loanMeta?.type) }
    },
  })
  return loans
}

// custody addresses of the collateral currently backing loans, grouped by chain
async function getCollateralOwners() {
  const pools = await getPools()
  const owners = {}
  for (const { name, collateralValue, poolMeta } of pools) {
    const lines = (poolMeta?.poolCollaterals ?? []).filter(c => Number(c.assetAmount) > 0)
    if (!lines.length && Number(collateralValue) > 0) throw new Error(`Maple: pool ${name} reports collateral but lists none`)
    for (const { blockchain, asset, addresses } of lines) {
      const collateral = COLLATERALS[`${blockchain}:${asset}`]
      if (!collateral) throw new Error(`Maple: unmapped collateral ${asset} on ${blockchain}`)
      if (!addresses?.length) throw new Error(`Maple: ${asset} collateral on ${blockchain} has no custody address`)
      owners[collateral.chain] ??= []
      for (const owner of addresses) for (const token of collateral.tokens ?? [null]) owners[collateral.chain].push([token, owner])
    }
  }
  return owners
}

async function addStrategyCash(api, pools) {
  // pool managers that predate strategies have no strategy list
  const lengths = await api.multiCall({ abi: 'uint256:strategyListLength', calls: pools.map(p => p.poolManager.id), permitFailure: true })
  const calls = pools.flatMap((p, i) => Array.from({ length: Number(lengths[i] ?? 0) }, (_, j) => ({ target: p.poolManager.id, params: [j], asset: p.asset.id })))
  const strategies = await api.multiCall({ abi: 'function strategyList(uint256) view returns (address)', calls: calls.map(({ target, params }) => ({ target, params })) })
  const factories = await api.multiCall({ abi: 'address:factory', calls: strategies })
  // a strategy holds idle cash unless it is a listed loan manager or comes from a loan manager factory
  const loanManagers = new Set(pools.flatMap(p => [p.loanManager?.id, p.openTermLoanManager?.id]).filter(Boolean).map(a => a.toLowerCase()))
  const cashStrategies = strategies.map((target, i) => ({ target, asset: calls[i].asset })).filter((s, i) => !loanManagers.has(s.target.toLowerCase()) && !LOAN_MANAGER_FACTORIES.includes(factories[i].toLowerCase()))
  const aum = await api.multiCall({ abi: 'uint256:assetsUnderManagement', calls: cashStrategies.map(s => s.target) })
  api.addTokens(cashStrategies.map(s => s.asset), aum)
}

async function ethereumTvl(api) {
  const pools = await getPools()
  const { ethereum = [] } = await getCollateralOwners()
  await addStrategyCash(api, pools)
  return api.sumTokens({ tokensAndOwners: [...pools.map(p => [p.asset.id, p.id]), ...ethereum] })
}

const collateralTvl = (chain) => async (api) => {
  const owners = (await getCollateralOwners())[chain] ?? []
  return sumTokens({ api, owners: owners.map(([, owner]) => owner), timestamp: api.timestamp })
}

async function borrowed(api) {
  const pools = await getPools()
  const loanManagers = {}
  for (const p of pools)
    for (const lm of [p.loanManager, p.openTermLoanManager]) if (lm) loanManagers[lm.id.toLowerCase()] = p.asset.id
  const principal = await api.multiCall({ abi: 'uint256:principalOut', calls: Object.keys(loanManagers) })
  api.addTokens(Object.values(loanManagers), principal)
  // the loan managers' principalOut includes the labelled loans, take their principal back out
  const poolAssets = Object.fromEntries(pools.map(p => [p.id.toLowerCase(), p.asset.id]))
  const labelled = await getLabelledLoans()
  const assets = labelled.map(l => poolAssets[l.fundingPool.id.toLowerCase()])
  if (assets.some(a => !a)) throw new Error('Maple: labelled loan from an unknown pool')
  const labelledPrincipal = await api.multiCall({ abi: 'uint256:principal', calls: labelled.map(l => l.id) })
  api.addTokens(assets, labelledPrincipal.map(v => -v))
}

async function staking(api) {
  return api.erc4626Sum({ calls: [stSYRUP], tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' })
}

module.exports = {
  methodology: 'TVL is the cash held by Maple pools on Ethereum, including cash deployed to yield strategies, plus borrower collateral: the balances of the collateral tokens at the custody addresses Maple publishes for each pool, read on the chain where they are held (BTC on Bitcoin, XRP on the XRP Ledger, ETH, wstETH, PYUSD and other tokens on Ethereum). Collateral Maple reports that is not held at those addresses is not counted. Borrowed is the principal outstanding in the pools\' loan managers, less the open-term loans Maple labels as its own cash deployments (AMM, DeFi, intercompany, strategy, T-bills, term basis), which Maple does not count as loans. Staking is SYRUP deposited in stSYRUP.',
  // custody addresses are only published for current loans
  timetravel: false,
  doublecounted: true, // we are counting collateral on other chains like bitcoin, these are not smart contracts, so should not be treated as defi tvl.
  hallmarks: [['2022-12-14', 'V2 Deployment']],
  ethereum: { tvl: ethereumTvl, borrowed, staking },
  hyperliquid: { tvl: () => ({}) },
  solana: { tvl: () => ({}) },
}

// every non-EVM collateral chain gets an export, so a newly mapped chain cannot be dropped silently
for (const { chain, tokens } of Object.values(COLLATERALS)) if (!tokens) module.exports[chain] = { tvl: collateralTvl(chain) }
