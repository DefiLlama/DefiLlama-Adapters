// DefiLlama TVL adapter for gage. Every address comes from ./universe.json, generated from gage's deployment manifest;
// each one is published with its role at https://docs.gage.cash/protocol/addresses.
const { unwrapUniswapV3NFT, unwrapUniswapV4NFTs } = require('../helper/unwrapLPs')
const U = require('./universe.json')

const KIND = { ERC20: 0, UNIV4_POSITION: 1, UNIV3_POSITION: 2 }
const DEAL = { NONE: 0, LISTED: 1, FUNDED: 2, RECLAIMED: 3, CLAIMED: 4, CANCELLED: 5 }
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
    const [owners, unwound] = await Promise.all([
      api.multiCall({ abi: 'function ownerOf(uint256) view returns (address)', calls: nft.map((l) => ({ target: l.token, params: [l.collateral] })), permitFailure: true }),
      api.multiCall({ abi: 'function recovered() view returns (bool)', calls: nft.map((l) => l.account) }),
    ])
    const recovered = nft.filter((_, i) => unwound[i])
    nft.forEach((l, i) => {
      if (unwound[i]) return // Emptied in place: the NFT stays at zero liquidity and its two tokens are read below.
      const owned = typeof owners[i] === 'string' && lower(owners[i]) === lower(l.account)
      if (owned) group(groups, Number(l.kind) === KIND.UNIV3_POSITION ? 'v3' : 'v4', l.token, l.collateral)
      // An open loan's NFT can only be in its account; a closed loan's may have been withdrawn.
      else if ([LOAN.FUNDING, LOAN.ACTIVE].includes(Number(l.state))) throw new Error(`Gage user NFT is missing from loan account custody: ${engine.engine} #${l.id}`)
    })
    // A recovered position's two tokens wait in the account until each lender withdraws its share.
    if (recovered.length) {
      const tokens = await api.multiCall({ abi: 'function recoveryTokens(uint256) view returns (address)', calls: recovered.flatMap((l) => [0, 1].map((i) => ({ target: l.account, params: [i] }))) })
      await addHoldings(api, tokens.map((token, i) => [token, recovered[Math.floor(i / 2)].account]))
    }
  }
}

/** Add what each owner holds of each token, a native-currency balance as WETH; own and receipt tokens are skipped. */
async function addHoldings(api, tokensAndOwners) {
  const erc20 = tokensAndOwners.map(([token, owner]) => [lower(token), owner]).filter(([token]) => token !== ZERO && !isExcluded(token))
  const native = tokensAndOwners.filter(([token]) => lower(token) === ZERO).map(([, owner]) => owner)
  if (erc20.length) {
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: erc20.map(([target, owner]) => ({ target, params: owner })) })
    erc20.forEach(([token], i) => api.add(token, balances[i]))
  }
  if (native.length) (await api.getEthBalances({ owners: native })).forEach((balance) => api.add(U.weth, balance))
}

const EARN_VERSION = { hybrid: 2, earn: 3 } // Factory kind → strategy design: HybridVault (2), EarnVault (3).
const POCKET_ABI = {
  2: 'function pockets(uint256) view returns (uint256 dealId, address token, uint256 amount, uint256 supply, uint256 claimed)',
  3: 'function pockets(uint256) view returns (uint256 loanId, address token, uint256 amount, uint256 supply, uint256 claimed, uint64 snapshotId)',
}

/**
 * Earn strategies: USDG idle in the strategy, USDG a repayment brought in that no loan outcome has booked yet, the
 * strategy's position in the external ERC-4626 reserve at the reserve's own conversion, and collateral recovered from
 * defaults into side pockets that depositors have not claimed yet. Principal a strategy has lent is engine principal
 * and is reported under borrowed, never twice.
 */
async function earnTvl(api) {
  const block = await api.getBlock()
  const vaults = new Map(U.earn.filter((s) => block >= s.startBlock).map((s) => [s.vault, s.version]))
  for (const f of U.factories) {
    if (block < f.startBlock) continue
    const count = Number(await api.call({ target: f.address, abi: 'uint256:count' }))
    if (count) (await api.multiCall({ target: f.address, abi: 'function vaults(uint256) view returns (address)', calls: range(count).map((i) => i - 1) })).forEach((v) => { if (!vaults.has(lower(v))) vaults.set(lower(v), EARN_VERSION[f.kind]) })
  }
  const list = [...vaults.keys()]
  if (!list.length) return
  const v2 = list.filter((v) => vaults.get(v) === 2)
  const v3 = list.filter((v) => vaults.get(v) === 3)
  const [cash, shares, reserves, pocketCounts, unassigned, harvested, assigned] = await Promise.all([
    api.multiCall({ abi: 'uint256:cash', calls: list }),
    api.multiCall({ abi: 'uint256:reserveShares', calls: list }),
    api.multiCall({ abi: 'address:RESERVE', calls: list }),
    api.multiCall({ abi: 'uint256:pocketCount', calls: list }),
    v3.length ? api.multiCall({ abi: 'uint256:unassignedCash', calls: v3 }) : [],
    v2.length ? api.multiCall({ abi: 'uint256:harvestedCash', calls: v2 }) : [],
    v2.length ? api.multiCall({ abi: 'uint256:assignedCash', calls: v2 }) : [],
  ])
  const assets = await api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: list.map((_, i) => ({ target: reserves[i], params: [shares[i]] })) })
  list.forEach((_, i) => api.add(U.usdg, (BigInt(cash[i]) + BigInt(assets[i])).toString()))
  unassigned.forEach((amount) => api.add(U.usdg, amount))
  harvested.forEach((amount, i) => api.add(U.usdg, (BigInt(amount) - BigInt(assigned[i])).toString()))
  const pockets = []
  for (const version of [2, 3]) {
    const calls = list.flatMap((target, i) => (vaults.get(target) === version ? range(pocketCounts[i]).map((id) => ({ target, params: [id] })) : []))
    if (calls.length) (await api.multiCall({ abi: POCKET_ABI[version], calls })).forEach((p, i) => pockets.push({ vault: calls[i].target, token: p.token, left: BigInt(p.amount) - BigInt(p.claimed) }))
  }
  // A pocket holds its recovered asset for the holders of record until each one claims: amount minus claimed.
  for (const p of pockets) {
    if (p.left === 0n || isExcluded(p.token)) continue
    api.add(lower(p.token) === ZERO ? U.weth : lower(p.token), p.left.toString())
  }
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
  methodology: 'Counts user collateral in custody across every Gage lending contract (listed at docs.gage.cash/protocol/addresses): the legacy deal vaults (ERC-20 collateral, including collateral awaiting withdrawal, and USDG escrowed for open bids) and the V2 engines (collateral held by each loan account, whatever the loan state, and USDG committed to loans that have not activated). Earn strategies add their idle USDG, repayments they have received but not yet booked, their position in the external ERC-4626 reserve and collateral recovered from defaults that depositors have not claimed yet. USDG credited for withdrawal (loan proceeds, repayments, withdrawn bids, protocol fees) is excluded. Vault-owned Uniswap V3/V4 NFTs are unwrapped into underlying principal without uncollected fees. Gross active loan principal is reported separately under borrowed until repayment, claim or a finalised default. Excludes GAGE, sGAGE, the internal receipt tokens, reward reserves, the treasury and the protocol-owned GAGE/sGAGE pool. Token balances are priced by DefiLlama.',
  [U.chain]: { tvl, borrowed },
}
