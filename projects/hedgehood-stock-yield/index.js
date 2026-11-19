const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Stock Yield by HedgeHood: covered-call vaults on tokenized stocks, on Robinhood Chain and BNB Chain (bStocks).
// v1: BrokerEpochVault holds depositors' stock, sells one weekly call against it to a quoted
// option buyer and pays the premium out in USDG. Source verified on Sourcify, e.g.
// https://sourcify.dev/server/v2/contract/4663/0xe35B7D7bf1212b89478ddAba2946ADEd59BEC0a9
const VAULTS = [
  '0xe35B7D7bf1212b89478ddAba2946ADEd59BEC0a9', // NVDA Printer (hNVDA), deployed at block 84792706
]
// v2: EpochFund strategy funds (covered call, wheel, ...), every one listed in a VaultRegistry, with its deployment block.
// v2.0 (Robinhood Chain, 2026-10-15) is closing (exits only); v2.1 runs on Robinhood Chain (weekly, USDG) and on
// BNB Chain (monthly covered calls on bStocks, USDT)
const V2_REGISTRIES = {
  robinhood: [
    ['0x868502F926AE068B61EA9CC55042A9F962651e76', 88943541], // v2.0, 2026-10-15
    ['0xbc2cf782d3530c867157E6b7A7bBe2E0b636cDAf', 103790627], // v2.1, 2026-11-01
  ],
  bsc: [
    ['0xC78b6A83d75C5612a1A7323702B56038254a6459', 131164584], // v2.1, 2026-11-02
  ],
}
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
  const block = await api.getBlock()
  const registries = V2_REGISTRIES[api.chain].filter(([, deployed]) => block >= deployed).map(([registry]) => registry)
  if (!registries.length) return
  const funds = (await api.multiCall({ abi: 'address[]:vaults', calls: registries })).flat()
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
    "TVL counts what depositors own in each Stock Yield vault. v1 vaults are read from managedBalances(): the stock token (active, queued for the next epoch, and redeemed but not yet claimed) plus earned premiums not yet claimed, in USDG. v2 funds, discovered from the v2.0 and v2.1 VaultRegistries on Robinhood Chain and the v2.1 VaultRegistry on BNB Chain, count the stock token and the stablecoin (USDG on Robinhood Chain, USDT on BNB Chain) each fund holds. Staking counts HEDGE staked in the HEDGE staking contract.",
  start: 1791614176, // 2026-10-10 06:36:16 UTC, first vault's deployment block 84792706
  robinhood: {
    tvl,
    staking: staking(HEDGE_STAKING_GATE, HEDGE),
  },
  bsc: {
    tvl: v2Tvl,
  },
}
