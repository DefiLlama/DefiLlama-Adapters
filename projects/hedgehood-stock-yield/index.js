const ADDRESSES = require('../helper/coreAssets.json')

// Stock Yield by HedgeHood: weekly covered-call vaults on Robinhood Chain stock tokens.
// v1: BrokerEpochVault holds depositors' stock, sells one weekly call against it to a quoted
// option buyer and pays the premium out in USDG. Source verified on Sourcify, e.g.
// https://sourcify.dev/server/v2/contract/4663/0xe35B7D7bf1212b89478ddAba2946ADEd59BEC0a9
const VAULTS = [
  '0xe35B7D7bf1212b89478ddAba2946ADEd59BEC0a9', // NVDA Printer (hNVDA), deployed at block 84792706
]
// v2: EpochFund strategy funds (covered call, wheel, ...), every one listed in this registry
const V2_REGISTRY = '0x868502F926AE068B61EA9CC55042A9F962651e76'
// Deposits require staking HEDGE in this gate
const HEDGE = '0x3f9108a3bECa998C14c6dda822a7e8EaEb88E20D'
const HEDGE_STAKING_GATE = '0x48ae41142bb0Ddd18DC49BD659b55207FAcE64d8'

async function v1Tvl(api) {
  const stocks = await api.multiCall({ abi: 'address:stock', calls: VAULTS })
  // managedBalances = depositor stock (active + queued deposits + redeemed but unclaimed) and earned, unclaimed USDG
  // premiums. It leaves out the option buyer's escrowed premium before settlement, the buyer's exercised stock,
  // fees owed to the protocol and unsolicited transfers.
  const balances = await api.multiCall({
    abi: 'function managedBalances() view returns (uint256 stockAmount, uint256 usdgAmount)',
    calls: VAULTS,
  })
  balances.forEach(({ stockAmount, usdgAmount }, i) => {
    api.add(stocks[i], stockAmount)
    api.add(ADDRESSES.robinhood.USDG, usdgAmount)
  })
}

async function v2Tvl(api) {
  const funds = await api.call({ abi: 'address[]:vaults', target: V2_REGISTRY })
  if (!funds.length) return
  const read = (fields) => Promise.all(fields.map((f) => api.multiCall({ abi: `uint256:${f}`, calls: funds })))
  const [stocks, usdgs] = await Promise.all(['stock', 'usdg'].map((f) => api.multiCall({ abi: `address:${f}`, calls: funds })))
  // Depositor assets: NAV (stockHeld/usdgHeld, including what is locked as option collateral), queued deposits
  // (pending*) and redeemed or refunded assets not yet claimed (reserved*). The option buyer's escrowed premium
  // (engineEscrow) and what engines owe counterparties (engineStock/engineUsdg) sit outside NAV and are left out.
  const stockParts = await read(['stockHeld', 'pendingStock', 'reservedStock'])
  const usdgParts = await read(['usdgHeld', 'pendingUsdg', 'reservedUsdg'])
  funds.forEach((_, i) => {
    stockParts.forEach((part) => api.add(stocks[i], part[i]))
    usdgParts.forEach((part) => api.add(usdgs[i], part[i]))
  })
}

async function tvl(api) {
  await Promise.all([v1Tvl(api), v2Tvl(api)])
}

// HEDGE trades only in a Uniswap V4 pool the coins server does not price, so it is priced by its CoinGecko id
async function staking(api) {
  const staked = await api.call({ abi: 'erc20:balanceOf', target: HEDGE, params: [HEDGE_STAKING_GATE] })
  api.addCGToken('hedgehood', staked / 1e18)
}

module.exports = {
  methodology:
    "TVL counts what depositors own in each Stock Yield vault. v1 vaults are read from managedBalances(): the stock token (active, queued for the next epoch, and redeemed but not yet claimed) plus earned premiums not yet claimed, in USDG. v2 funds, discovered from the v2 VaultRegistry, are read from stockHeld/usdgHeld (NAV, including assets locked as option collateral), pendingStock/pendingUsdg (queued deposits) and reservedStock/reservedUsdg (redeemed but not yet claimed). The option buyer's premium is counted once the epoch settles and it is credited to depositors; the protocol fee, the buyer's exercised stock and the separately funded exit pool are excluded. Staking counts HEDGE staked in the deposit gate shared by v1 and v2, priced by its CoinGecko id.",
  start: 1791614176, // 2026-10-10 06:36:16 UTC, first vault's deployment block 84792706
  robinhood: {
    tvl,
    staking,
  },
}
