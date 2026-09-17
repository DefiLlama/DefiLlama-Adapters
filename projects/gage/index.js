const { unwrapUniswapV3NFT, unwrapUniswapV4NFTs } = require('../helper/unwrapLPs')

// Immutable deployments; new vaults must be added explicitly.
// https://docs.gage.cash/protocol/addresses
const vaults = [
  { address: '0x3D979740785ABd8b7Dd5c2Ff7Bf100CBe86fcBDF', fromBlock: 57067880, kind: 1 },
  { address: '0xc23A08282AA1A9141C6fD7A29e7dFbFe841cC6B6', fromBlock: 57225875, kind: 1 },
  { address: '0xe3628a01eaca2e7b0EC71Ed7bA616b997fEf9cDE', fromBlock: 57272387, kind: 2 },
]
const stateViewer = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const blacklistedTokens = [
  '0x7163ae1b5aea2f09ebc609c52b4dcac0a7a4bc2d', // GAGE
  '0x78c88cf8f6e612955526ceb501be82bf3279bd5d', // sGAGE
  '0x647d46c0577453be8c75039f829740b5d2e44938', // GAGE-RECEIPT: 1-wei internal receipt, deals are router round-trips with no collateral
]
const dealAbi = 'function getDeal(uint256) view returns ((address borrower, uint8 kind, uint8 state, uint32 term, uint40 listingExpiry, address token, uint40 fundedAt, uint40 expiry, uint256 amountOrTokenId, uint128 cap, uint128 minPrice, address lender, uint128 price, uint128 fee))'
const bidAbi = 'function getBid(uint256) view returns ((uint256 dealId, address lender, uint128 price, uint40 expiry, uint8 state))'
const balanceUSDGAbi = 'function balanceUSDG(address) view returns (uint256)'
const isBlacklisted = (token) => blacklistedTokens.includes(token.toLowerCase())

async function getVaults(api) {
  const block = await api.getBlock() // Pin discovery, custody and LP state to the same block.
  return Promise.all(vaults.filter(v => block >= v.fromBlock).map(async (vault) => {
    const [count, usdg] = await Promise.all([
      api.call({ target: vault.address, abi: 'uint256:dealCount' }),
      api.call({ target: vault.address, abi: 'address:USDG' }),
    ])
    const length = Number(count)
    if (!Number.isSafeInteger(length) || length < 0) throw new Error('Invalid Gage deal count')
    const allDeals = length ? await api.multiCall({
      target: vault.address, abi: dealAbi,
      calls: Array.from({ length }, (_, i) => i + 1),
    }) : []
    // allDeals is kept for USDG credit accounting; deals excludes blacklisted collateral from tvl and borrowed.
    const deals = allDeals.filter(d => !isBlacklisted(d.token))
    return { ...vault, usdg, deals, allDeals }
  }))
}

// USDG held by a vault is either lender escrow for OPEN bids or a balanceUSDG credit awaiting withdrawal
// (borrower loan proceeds, lender repayments, withdrawn bids, protocol fees). Only the escrow is TVL:
// subtract every credit holder's balance. Credit holders are the fee sink, deal parties and bid lenders.
async function getUsdgCredits(api, vault, feeSink) {
  const bidCount = Number(await api.call({ target: vault.address, abi: 'uint256:bidCount' }))
  const bids = bidCount ? await api.multiCall({
    target: vault.address, abi: bidAbi,
    calls: Array.from({ length: bidCount }, (_, i) => i + 1),
  }) : []
  const creditHolders = [feeSink]
  for (const d of vault.allDeals) creditHolders.push(d.borrower, d.lender) // unfunded deals have a zero lender, which simply reads 0
  for (const b of bids) creditHolders.push(b.lender)
  const parties = [...new Set(creditHolders.map(a => a.toLowerCase()))]
  const credits = await api.multiCall({ target: vault.address, abi: balanceUSDGAbi, calls: parties })
  return credits.reduce((sum, c) => sum + BigInt(c), 0n)
}

async function tvl(api) {
  for (const vault of await getVaults(api)) {
    const [feeSink, manager] = await Promise.all([
      api.call({ target: vault.address, abi: 'address:FEE_SINK' }),
      api.call({ target: vault.address, abi: 'address:POSITION_MANAGER' }),
    ])
    // Include tokens from settled and delisted deals: withdrawals are a separate transaction.
    const tokens = [...new Set([vault.usdg, ...vault.deals.filter(d => Number(d.kind) === 0).map(d => d.token)]
      .map(t => t.toLowerCase()))].filter(t => !isBlacklisted(t))
    const [balances, usdgCredits] = await Promise.all([
      api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(target => ({ target, params: vault.address })) }),
      getUsdgCredits(api, vault, feeSink),
    ])
    tokens.forEach((token, i) => {
      let amount = BigInt(balances[i])
      if (token === vault.usdg.toLowerCase()) amount -= usdgCredits
      if (amount < 0n) throw new Error(`Gage USDG credits exceed custody: ${vault.address}`)
      api.add(token, amount.toString())
    })

    const nftDeals = vault.deals.filter(d => Number(d.kind) !== 0)
    if (nftDeals.some(d => Number(d.kind) !== vault.kind || d.token.toLowerCase() !== manager.toLowerCase()))
      throw new Error(`Unexpected Gage position manager or kind: ${vault.address}`)
    // Settled positions stay in TVL until their user credit is withdrawn. A withdrawn NFT can
    // later be burned; do not call ownerOf for it or count unsolicited transferFrom donations.
    const settled = nftDeals.filter(d => [3, 4, 5].includes(Number(d.state)))
    const owed = settled.length ? await api.multiCall({
      target: vault.address, abi: 'function owedNFT(address,uint256) view returns (bool)',
      calls: settled.map(d => ({ params: [Number(d.state) === 4 ? d.lender : d.borrower, d.amountOrTokenId] })),
    }) : []
    const positionIds = [...new Set([
      ...nftDeals.filter(d => [1, 2].includes(Number(d.state))),
      ...settled.filter((_, i) => owed[i]),
    ].map(d => String(d.amountOrTokenId)))]
    const owners = positionIds.length ? await api.multiCall({
      target: manager, abi: 'function ownerOf(uint256) view returns (address)',
      calls: positionIds,
    }) : []
    if (owners.some(owner => typeof owner !== 'string' || owner.toLowerCase() !== vault.address.toLowerCase()))
      throw new Error(`Gage user NFT is missing from vault custody: ${vault.address}`)
    if (!positionIds.length) continue // An empty v4 ID list would trigger unsupported subgraph discovery.

    const config = { api, balances: api.getBalances(), nftAddress: manager, blacklistedTokens }
    if (vault.kind === 1) await unwrapUniswapV4NFTs({ ...config, stateViewer, uniV4ExtraConfig: { positionIds } })
    else await unwrapUniswapV3NFT({ ...config, uniV3ExtraConfig: { positionIds } })
  }
}

async function borrowed(api) {
  for (const vault of await getVaults(api)) {
    // Gross funded principal remains outstanding until reclaim/claim, including the grace period.
    // Repayment caps are not balances, and proceeds awaiting withdrawal are still gross funded loans.
    const amount = vault.deals.filter(d => Number(d.state) === 2).reduce((sum, d) => sum + BigInt(d.price), 0n)
    api.add(vault.usdg, amount.toString())
  }
}

module.exports = {
  timetravel: true, // Historical runs require an archive RPC, e.g. https://rpc.ordofi.network.
  doublecounted: true, // Escrowed LP underlying assets are also counted by Uniswap V3/V4.
  start: '2026-09-07',
  methodology: 'Counts user ERC20 collateral held in all three Gage lending vaults, including collateral awaiting withdrawal, plus USDG escrowed for open lender bids. USDG credited to accounts for withdrawal (borrower loan proceeds, lender repayments, withdrawn bids, protocol fees) is excluded. Vault-owned Uniswap V3/V4 NFTs are unwrapped into underlying principal, excluding uncollected LP fees; these LP assets overlap with Uniswap V3/V4 TVL. Outstanding gross funded principal is reported separately under borrowed until reclaim or claim, including overdue unsettled deals. Excludes GAGE/sGAGE, the internal GAGE-RECEIPT token and deals collateralised by it, reward reserves, treasury and the external GAGE/sGAGE pool. Token balances are priced by DefiLlama.',
  robinhood: { tvl, borrowed },
}
