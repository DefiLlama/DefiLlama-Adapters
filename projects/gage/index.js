// DefiLlama TVL adapter for gage (DefiLlama-Adapters: projects/gage/index.js). Upstream copy of this file.
// Every address comes from ./universe.json, generated from the live deployment manifest by
// `node scripts/defillama-universe.mjs` in github.com/DebenLabs/gagedotcash (docs/TVL-REPORTING.md).
const { unwrapUniswapV3NFT, unwrapUniswapV4NFTs } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const U = require('./universe.json')

const KIND = { ERC20: 0, UNIV4_POSITION: 1, UNIV3_POSITION: 2 }
const DEAL = { LISTED: 0, FUNDED: 1, RECLAIMED: 2, CLAIMED: 3, CANCELLED: 4 }
const LOAN = { NONE: 0, FUNDING: 1, ACTIVE: 2, REPAID: 3, DEFAULTED: 4, CANCELLED: 5 }
const UNITS = 4n
const ZERO = '0x0000000000000000000000000000000000000000'
const excluded = new Set(U.excludedTokens)
const lower = (a) => String(a).toLowerCase()
const isExcluded = (token) => excluded.has(lower(token))
const range = (n) => Array.from({ length: Number(n) }, (_, i) => i + 1)

const dealAbi = 'function getDeal(uint256) view returns ((address borrower, uint8 kind, uint8 state, uint32 term, uint40 listingExpiry, address token, uint40 fundedAt, uint40 expiry, uint256 amountOrTokenId, uint128 cap, uint128 minPrice, address lender, uint128 price, uint128 fee))'
const bidAbi = 'function getBid(uint256) view returns ((uint256 dealId, address lender, uint128 price, uint40 expiry, uint8 state))'
const loanAbi = 'function getLoan(uint256) view returns ((address originator, address account, address token, address collateralBeneficiary, uint8 kind, uint8 state, uint8 filled, uint32 term, uint40 fundingDeadline, uint40 fundedAt, uint40 closedAt, uint128 principal, uint128 cap, uint128 originationFee, uint128 borrowerReward, uint128 lenderReward, uint256 collateral, bytes32 exposureKey, uint256 exposureAmount))'

/** GageV2Vault._slice: principal split in four, the first slots carrying the remainder. */
const slice = (total, i) => total / UNITS + (BigInt(i) < total % UNITS ? 1n : 0n)
/** USDG the engine escrows for a loan that has not activated: the principal of its filled slots. */
function fundingEscrow(loan) {
  if (Number(loan.state) !== LOAN.FUNDING) return 0n
  let amount = 0n
  for (let i = 0; i < Number(loan.filled); i++) amount += slice(BigInt(loan.principal), i)
  return amount
}

/** Every deal and bid of a legacy vault at the block, or nothing before the vault existed. */
async function vaultDeals(api, vault) {
  const block = await api.getBlock()
  if (block < vault.startBlock) return { deals: [], bids: [] }
  const [count, bidCount] = await Promise.all([
    api.call({ target: vault.address, abi: 'uint256:dealCount' }),
    api.call({ target: vault.address, abi: 'uint256:bidCount' }),
  ])
  const [deals, bids] = await Promise.all([
    Number(count) ? api.multiCall({ target: vault.address, abi: dealAbi, calls: range(count) }) : [],
    Number(bidCount) ? api.multiCall({ target: vault.address, abi: bidAbi, calls: range(bidCount) }) : [],
  ])
  return { deals, bids }
}

/**
 * USDG a vault holds is lender escrow for open bids plus credits awaiting withdrawal (loan proceeds, repayments,
 * withdrawn bids, protocol fees). Only the escrow is TVL: subtract every credit holder's balance.
 */
async function usdgCredits(api, vault, deals, bids) {
  const holders = [...new Set([vault.feeSink, ...deals.flatMap((d) => [d.borrower, d.lender]), ...bids.map((b) => b.lender)].map(lower).filter((a) => a !== ZERO))]
  const credits = await api.multiCall({ target: vault.address, abi: 'function balanceUSDG(address) view returns (uint256)', calls: holders })
  return credits.reduce((sum, c) => sum + BigInt(c), 0n)
}

/** Unwrap the collected LP NFTs into their underlying tokens, one helper call per (protocol, manager). */
async function unwrap(api, groups) {
  for (const [key, positionIds] of groups) {
    const [protocol, manager] = key.split(':')
    if (!positionIds.length) continue // An empty v4 ID list would trigger unsupported subgraph discovery.
    const config = { api, balances: api.getBalances(), nftAddress: manager, blacklistedTokens: U.excludedTokens }
    if (protocol === 'v4') await unwrapUniswapV4NFTs({ ...config, stateViewer: U.stateView, uniV4ExtraConfig: { positionIds } })
    else await unwrapUniswapV3NFT({ ...config, uniV3ExtraConfig: { positionIds } })
  }
}
/** Queue an LP NFT for unwrapping under its protocol and position manager, once. */
const group = (groups, protocol, manager, id) => {
  const key = `${protocol}:${lower(manager)}`
  if (!groups.has(key)) groups.set(key, [])
  if (!groups.get(key).includes(String(id))) groups.get(key).push(String(id))
}

/** Custody of every legacy vault: ERC-20 collateral, open-bid USDG escrow and the LP NFTs it still owns. */
async function legacyTvl(api, groups) {
  for (const vault of U.vaults) {
    const { deals, bids } = await vaultDeals(api, vault)
    if (!deals.length && !bids.length) continue
    // Collateral awaiting withdrawal after settlement still counts: withdrawal is a separate transaction.
    const tokens = [...new Set([U.usdg, ...deals.filter((d) => Number(d.kind) === KIND.ERC20).map((d) => lower(d.token))])].filter((t) => !isExcluded(t))
    const [balances, credits] = await Promise.all([
      api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((target) => ({ target, params: vault.address })) }),
      usdgCredits(api, vault, deals, bids),
    ])
    tokens.forEach((token, i) => {
      let amount = BigInt(balances[i])
      if (token === U.usdg) amount -= credits
      if (amount < 0n) throw new Error(`Gage USDG credits exceed custody: ${vault.address}`)
      api.add(token, amount.toString())
    })
    const nftDeals = deals.filter((d) => Number(d.kind) !== KIND.ERC20)
    const settled = nftDeals.filter((d) => [DEAL.RECLAIMED, DEAL.CLAIMED, DEAL.CANCELLED].includes(Number(d.state)))
    const owed = settled.length ? await api.multiCall({
      target: vault.address, abi: 'function owedNFT(address,uint256) view returns (bool)',
      calls: settled.map((d) => ({ params: [Number(d.state) === DEAL.CLAIMED ? d.lender : d.borrower, d.amountOrTokenId] })),
    }) : []
    const held = [...nftDeals.filter((d) => [DEAL.LISTED, DEAL.FUNDED].includes(Number(d.state))), ...settled.filter((_, i) => owed[i])]
    if (!held.length) continue
    // A withdrawn NFT can later be burned: only positions the vault still owns are unwrapped.
    const owners = await api.multiCall({ abi: 'function ownerOf(uint256) view returns (address)', calls: held.map((d) => ({ target: d.token, params: [d.amountOrTokenId] })), permitFailure: true })
    held.forEach((d, i) => {
      if (typeof owners[i] !== 'string' || lower(owners[i]) !== vault.address) throw new Error(`Gage user NFT is missing from vault custody: ${vault.address} #${d.amountOrTokenId}`)
      group(groups, Number(d.kind) === KIND.UNIV3_POSITION ? 'v3' : 'v4', d.token, d.amountOrTokenId)
    })
  }
}

/** Every loan of a V2 engine at the block, with its local id, or nothing before the engine existed. */
async function engineLoans(api, engine) {
  const block = await api.getBlock()
  if (block < engine.startBlock) return []
  const count = await api.call({ target: engine.engine, abi: 'uint256:loanCount' })
  if (!Number(count)) return []
  const loans = await api.multiCall({ target: engine.engine, abi: loanAbi, calls: range(count) })
  return loans.map((l, i) => ({ ...l, id: i + 1 })) // Loan IDs are local to an engine and start at 1.
}

/**
 * V2 engines keep each loan's collateral in its own account contract and lender USDG in the engine until the
 * fourth slot fills. Whatever an account still holds is user value in custody, whatever the loan's state.
 */
async function engineTvl(api, groups) {
  for (const engine of U.engines) {
    const loans = (await engineLoans(api, engine)).filter((l) => Number(l.state) !== LOAN.NONE && lower(l.account) !== ZERO)
    let escrow = 0n
    for (const l of loans) escrow += fundingEscrow(l)
    if (escrow > 0n) api.add(U.usdg, escrow.toString())
    const erc20 = loans.filter((l) => Number(l.kind) === KIND.ERC20 && !isExcluded(l.token))
    if (erc20.length) {
      const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: erc20.map((l) => ({ target: l.token, params: l.account })) })
      erc20.forEach((l, i) => api.add(lower(l.token), balances[i]))
    }
    const nft = loans.filter((l) => Number(l.kind) !== KIND.ERC20)
    if (!nft.length) continue
    const owners = await api.multiCall({ abi: 'function ownerOf(uint256) view returns (address)', calls: nft.map((l) => ({ target: l.token, params: [l.collateral] })), permitFailure: true })
    const recovered = nft.filter((l, i) => Number(l.state) === LOAN.DEFAULTED && (typeof owners[i] !== 'string' || lower(owners[i]) !== lower(l.account)))
    nft.forEach((l, i) => {
      const owned = typeof owners[i] === 'string' && lower(owners[i]) === lower(l.account)
      if (owned) group(groups, Number(l.kind) === KIND.UNIV3_POSITION ? 'v3' : 'v4', l.token, l.collateral)
      // An open loan's NFT can only be in its account; a closed loan's may have been withdrawn or unwound (below).
      else if ([LOAN.FUNDING, LOAN.ACTIVE].includes(Number(l.state))) throw new Error(`Gage user NFT is missing from loan account custody: ${engine.engine} #${l.id}`)
    })
    // A finalised default unwinds the position into the two underlying tokens, which wait in the account.
    if (recovered.length) {
      const logs = await getLogs({ api, target: engine.engine, eventAbi: 'event DefaultRecovered(uint256 indexed id, address[2] tokens, uint256[2] amounts)', onlyArgs: true, fromBlock: engine.startBlock })
      const byId = new Map(logs.map((log) => [String(log.id), log.tokens.map(lower)]))
      const calls = []
      for (const l of recovered) for (const token of byId.get(String(l.id)) ?? []) if (token !== ZERO && !isExcluded(token)) calls.push({ target: token, params: l.account })
      if (calls.length) {
        const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls })
        calls.forEach((c, i) => api.add(lower(c.target), balances[i]))
      }
    }
  }
}

/**
 * Earn strategies: USDG idle in the strategy and its position in the external ERC-4626 reserve, at the reserve's own
 * conversion. Principal a strategy has lent is engine principal and is reported under borrowed, never twice.
 */
async function earnTvl(api) {
  const block = await api.getBlock()
  const vaults = new Set(U.earn.filter((s) => block >= s.startBlock).map((s) => s.vault))
  for (const f of U.factories) {
    if (block < f.startBlock) continue
    const count = Number(await api.call({ target: f.address, abi: 'uint256:count' }))
    if (count) (await api.multiCall({ target: f.address, abi: 'function vaults(uint256) view returns (address)', calls: range(count).map((i) => i - 1) })).forEach((v) => vaults.add(lower(v)))
  }
  const list = [...vaults]
  if (!list.length) return
  const [cash, shares, reserves] = await Promise.all([
    api.multiCall({ abi: 'uint256:cash', calls: list }),
    api.multiCall({ abi: 'uint256:reserveShares', calls: list }),
    api.multiCall({ abi: 'address:RESERVE', calls: list }),
  ])
  const assets = await api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: list.map((_, i) => ({ target: reserves[i], params: [shares[i]] })) })
  list.forEach((_, i) => api.add(U.usdg, (BigInt(cash[i]) + BigInt(assets[i])).toString()))
}

/** Lending TVL on Robinhood Chain: what the protocol holds for its users, by token. */
async function tvl(api) {
  const groups = new Map()
  await legacyTvl(api, groups)
  await engineTvl(api, groups)
  await earnTvl(api)
  await unwrap(api, groups)
}

/**
 * Gross funded principal stays outstanding until repayment or the collateral claim. A legacy deal backed by an
 * engine receipt is that engine's loan and is counted there.
 */
async function borrowed(api) {
  for (const vault of U.vaults) {
    const { deals } = await vaultDeals(api, vault)
    const amount = deals.filter((d) => Number(d.state) === DEAL.FUNDED && !isExcluded(d.token)).reduce((sum, d) => sum + BigInt(d.price), 0n)
    if (amount > 0n) api.add(U.usdg, amount.toString())
  }
  for (const engine of U.engines) {
    const loans = await engineLoans(api, engine)
    const amount = loans.filter((l) => Number(l.state) === LOAN.ACTIVE).reduce((sum, l) => sum + BigInt(l.principal), 0n)
    if (amount > 0n) api.add(U.usdg, amount.toString())
  }
}

module.exports = {
  timetravel: true, // Historical runs need an archive RPC for Robinhood Chain.
  doublecounted: true, // LP collateral overlaps Uniswap V3/V4; the Earn reserve overlaps its own ERC-4626 listing.
  start: U.start,
  methodology: 'Counts user collateral in custody across every Gage lending contract the deployment manifest names: the legacy deal vaults (ERC-20 collateral, including collateral awaiting withdrawal, and USDG escrowed for open bids) and the V2 engines (collateral held by each loan account, whatever the loan state, and USDG committed to loans that have not activated). Earn strategies add their idle USDG and their position in the external ERC-4626 reserve. USDG credited for withdrawal (loan proceeds, repayments, withdrawn bids, protocol fees) is excluded. Vault-owned Uniswap V3/V4 NFTs are unwrapped into underlying principal without uncollected fees. Gross active loan principal is reported separately under borrowed until repayment or claim. Excludes GAGE, sGAGE, the internal receipt tokens, reward reserves, the treasury and the protocol-owned GAGE/sGAGE pool. Token balances are priced by DefiLlama.',
  [U.chain]: { tvl, borrowed },
}
