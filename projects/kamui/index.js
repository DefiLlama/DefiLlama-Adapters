const { getCuratorTvlWithRequiredErc4626 } = require('../helper/curators')
const ADDRESSES = require('../helper/coreAssets.json')

const PUBLIC_VAULTS = [
  '0xcDA323c2DF692d989B24BA51D0aCCa924cf9a344', // Stable (USDst)
  '0xA5AE405242f42C47996a0C6857ff10a77F9bdeE6', // Balanced (USDbl)
  '0x9E0DB8F43bb91e2148B0Db920E21370525CF3Aab', // Boosted (USDbt)
]
const KGEAR = '0xe9Fc51dF9168361c9cF00383C644Ae9dcF2aD6b0'
const KGEAR_START_BLOCK = 26240326
const FRXUSD = '0xCAcd6fd266aF91b8AeD52aCCc382b4e165586E29'
const REDEMPTION_PHANTOM = '0x5d1C51aE5219DEddEfAd70821D006fB40A4457f5'
const LATEST_ROUND_DATA = 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
const MARKETS = [
  {
    manager: '0x7d163c4358Ea3b41f6746b2fA08803346C4F0541',
    token: '0x7433806912Eae67919e66aea853d46Fa0aef98A8', // mGLOBAL, 18 decimals
    // mGLOBAL/USD NAV, not the DepositVault's NAV * 1.07 mint-price feed.
    navFeed: '0x66Aa9fcD63DF74e1f67A9452E6E59Fbc67f75E38',
    navDecimals: 8,
  },
  {
    manager: '0xBAdfE155662646A1A668c00276220B02FB7f1b23',
    token: '0x238a700eD6165261Cf8b2e544ba797BC11e466Ba', // legacy mF-ONE, 18 decimals
    navFeed: '0x8D51DBC85cEef637c97D02bdaAbb5E274850e68C',
    navDecimals: 8,
  },
]

async function addLeveragedAssets(api) {
  const safe = (await api.call({ target: KGEAR, abi: 'address:safe' })).toLowerCase()
  const owners = new Set([safe])
  for (const { manager } of MARKETS) {
    const accounts = [...new Set((await api.call({ target: manager, abi: 'function creditAccounts() view returns (address[])' })).map(a => a.toLowerCase()))]
    const borrowers = await api.multiCall({
      abi: 'function getBorrowerOrRevert(address) view returns (address)',
      calls: accounts.map(account => ({ target: manager, params: [account] })),
    })
    accounts.forEach((account, i) => {
      if (borrowers[i].toLowerCase() === safe) owners.add(account)
    })
  }

  const tokens = [ADDRESSES.ethereum.USDC, FRXUSD, REDEMPTION_PHANTOM, ...MARKETS.map(m => m.token)]
  const pairs = tokens.flatMap(token => [...owners].map(owner => ({ token, owner })))
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: pairs.map(({ token, owner }) => ({ target: token, params: [owner] })),
  })
  const totals = new Map(tokens.map(token => [token, 0n]))
  pairs.forEach(({ token }, i) => totals.set(token, totals.get(token) + BigInt(balances[i])))

  api.add(ADDRESSES.ethereum.USDC, totals.get(ADDRESSES.ethereum.USDC))
  // The legacy redemption phantom is an 18-decimal claim on frxUSD.
  api.add(FRXUSD, totals.get(FRXUSD) + totals.get(REDEMPTION_PHANTOM))
  for (const { token, navFeed, navDecimals } of MARKETS) {
    const balance = totals.get(token)
    if (balance === 0n) continue
    const round = await api.call({ target: navFeed, abi: LATEST_ROUND_DATA })
    const price = BigInt(round.answer)
    if (price <= 0n || BigInt(round.updatedAt) <= 0n) throw new Error('Kamui collateral NAV unavailable')
    api.addUSDValue(Number(balance * price / 10n ** BigInt(navDecimals)) / 1e18)
  }
}

async function removeNestedKgear(api) {
  const safes = await api.multiCall({ abi: 'address:safe', calls: PUBLIC_VAULTS })
  const holders = [...new Set([...PUBLIC_VAULTS, ...safes].map(a => a.toLowerCase()))]
  const shares = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: holders.map(holder => ({ target: KGEAR, params: [holder] })),
  })
  const held = shares.filter(balance => BigInt(balance) > 0n)
  if (!held.length) return
  const asset = await api.call({ target: KGEAR, abi: 'address:asset' })
  const amounts = await api.multiCall({
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    calls: held.map(balance => ({ target: KGEAR, params: [balance] })),
  })
  amounts.forEach(amount => api.add(asset, -BigInt(amount)))
}

async function tvl(api) {
  // Pin all reads, including the curator helper, to the same block.
  const block = await api.getBlock()
  await getCuratorTvlWithRequiredErc4626(api, { erc4626: PUBLIC_VAULTS })
  if (block >= KGEAR_START_BLOCK) {
    await addLeveragedAssets(api)
    await removeNestedKgear(api)
  }
  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  start: '2026-08-27',
  methodology: 'Counts Stable, Balanced and Boosted at totalAssets. Adds gross collateral and idle assets in the kGear Safe and its own Gearbox credit accounts, before debt. Midas collateral uses the issuer on-chain USD NAV. kGear totalAssets is not added; nested kGear shares held by the public vaults are removed. Partner-curated vaults and the legacy Balanced vault are excluded. Also counted under Lagoon, Gearbox and the underlying RWA protocols.',
  ethereum: { tvl },
}
