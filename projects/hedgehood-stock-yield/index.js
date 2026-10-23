const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Stock Yield by HedgeHood: weekly covered-call vaults on Robinhood Chain stock tokens.
// v1: BrokerEpochVault holds depositors' stock, sells one weekly call against it to a quoted
// option buyer and pays the premium out in USDG. Source verified on Sourcify, e.g.
// https://sourcify.dev/server/v2/contract/4663/0xe35B7D7bf1212b89478ddAba2946ADEd59BEC0a9
const VAULTS = [
  '0xe35B7D7bf1212b89478ddAba2946ADEd59BEC0a9', // NVDA Printer (hNVDA), deployed at block 84792706
]
// v2: EpochFund strategy funds (covered call, wheel, ...), every one listed in this registry
const V2_REGISTRY = '0x868502F926AE068B61EA9CC55042A9F962651e76'
const V2_REGISTRY_BLOCK = 88943541 // 2026-10-15, registry deployment
// HEDGE staking: gates v1 deposits; stakers are paid a share of the funds' protocol fee
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
  if (await api.getBlock() < V2_REGISTRY_BLOCK) return
  const funds = await api.call({ abi: 'address[]:vaults', target: V2_REGISTRY })
  const stocks = await api.multiCall({ abi: 'address:stock', calls: funds })
  const usdgs = await api.multiCall({ abi: 'address:usdg', calls: funds })
  return sumTokens2({ api, tokensAndOwners: funds.flatMap((fund, i) => [[stocks[i], fund], [usdgs[i], fund]]) })
}

async function tvl(api) {
  await v1Tvl(api)
  await v2Tvl(api)
}

module.exports = {
  methodology:
    "TVL counts what depositors own in each Stock Yield vault. v1 vaults are read from managedBalances(): the stock token (active, queued for the next epoch, and redeemed but not yet claimed) plus earned premiums not yet claimed, in USDG. v2 funds, discovered from the v2 VaultRegistry, count the stock token and USDG each fund holds. Staking counts HEDGE staked in the HEDGE staking contract.",
  start: 1791614176, // 2026-10-10 06:36:16 UTC, first vault's deployment block 84792706
  robinhood: {
    tvl,
    staking: staking(HEDGE_STAKING_GATE, HEDGE),
  },
}
