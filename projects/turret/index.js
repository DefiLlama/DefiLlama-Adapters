const config = require('./config')

const nftOfferAbi = 'function getOffer(uint256) view returns ((address lender, (address borrower, address collection, uint256 tokenId, uint256 principal, uint256 interest, uint256 duration, uint256 expiresAt) terms, address vault, uint256 dueAt, uint8 status, uint256 usdgCredit, address nftBeneficiary))'

const getPools = (api) => api.multiCall({ abi: 'address:pool', calls: config.engines.map(e => e.engine) })

async function tvl(api) {
  // Pool totalAssets includes loans and accrued interest. Only cash belongs in TVL;
  // availableCash also removes protocol fees already owed to the treasury/router.
  const cash = await api.multiCall({ abi: 'uint256:availableCash', calls: await getPools(api) })
  cash.forEach(balance => api.add(config.usdg, balance))

  const tokensAndOwners = config.engines.map(e => [e.collateral, e.engine])
  const legacyCollateral = await api.fetchList({
    target: config.legacyVault,
    lengthAbi: 'uint256:collateralCount',
    itemAbi: 'function collateralAt(uint256) view returns (address)',
  })
  ;[config.usdg, ...legacyCollateral].forEach(token => tokensAndOwners.push([token, config.legacyVault]))

  // V1/V2 hold both open-offer cash and collateral at the market contract.
  config.p2pMarkets.forEach(m => {
    tokensAndOwners.push([config.usdg, m.address], [m.collateral, m.address])
  })

  // V3 custody is in per-offer vaults. Include settled vaults because withdrawal
  // credits can remain there. nextOfferId is exclusive, not a one-based count.
  const markets = config.p2pV3Markets
  const vaults = await api.fetchList({
    targets: markets.map(m => m.address),
    lengthAbi: 'uint256:nextOfferId',
    itemAbi: 'function vaults(uint256) view returns (address)',
    startFrom: 1,
    groupedByInput: true,
  })
  vaults.forEach((owners, i) => owners.forEach(owner => {
    tokensAndOwners.push([config.usdg, owner], [markets[i].collateral, owner])
  }))

  const nftVaults = await api.fetchList({
    target: config.nftMarket,
    lengthAbi: 'uint256:nextOfferId',
    itemAbi: nftOfferAbi,
    field: 'vault',
    startFrom: 1,
  })
  // Count escrowed USDG only; no unsupported NFT floor-price assumptions.
  nftVaults.forEach(owner => tokensAndOwners.push([config.usdg, owner]))
  return api.sumTokens({ tokensAndOwners })
}

async function borrowed(api) {
  const principal = await api.multiCall({ abi: 'uint256:outstandingPrincipal', calls: await getPools(api) })
  principal.forEach(balance => api.add(config.usdg, balance))
  api.add(config.usdg, await api.call({ target: config.legacyVault, abi: 'uint256:totalDebt' }))

  const calls = [...config.p2pMarkets, ...config.p2pV3Markets].map(m => m.address)
  const committed = await api.multiCall({ abi: 'uint256:committedPrincipal', calls })
  const reserved = await api.multiCall({ abi: 'uint256:reservedPrincipal', calls })
  committed.forEach((balance, i) => {
    const active = BigInt(balance) - BigInt(reserved[i])
    if (active < 0n) throw new Error(`Invalid P2P principal accounting: ${calls[i]}`)
    api.add(config.usdg, active.toString())
  })
  api.add(config.usdg, await api.call({ target: config.nftMarket, abi: 'uint256:activePrincipal' }))
}

module.exports = {
  // Contract inventory baseline, not the protocol's launch date.
  start: '2026-09-10',
  methodology: 'Counts available lending cash (excluding accrued protocol fees), ERC-20 collateral held by credit engines, and cash/collateral in P2P escrow including unwithdrawn settlement credits. Includes legacy custody without counting pool receipt tokens. Outstanding loans are reported under borrowed. TURRET staking is excluded. Treasury wallets, reward reserves and NFT collateral valuations are excluded.',
  robinhood: { tvl, borrowed },
}
