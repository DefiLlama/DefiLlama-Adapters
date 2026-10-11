const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

// Stock Yield by HedgeHood: weekly covered-call vaults on Robinhood Chain stock tokens.
// Each vault (BrokerEpochVault) holds depositors' stock, sells one weekly call against it to a quoted
// option buyer and pays the premium out in USDG. Source verified on Sourcify, e.g.
// https://sourcify.dev/server/v2/contract/4663/0xe35B7D7bf1212b89478ddAba2946ADEd59BEC0a9
const VAULTS = [
  '0xe35B7D7bf1212b89478ddAba2946ADEd59BEC0a9', // NVDA Printer (hNVDA), deployed at block 84792706
]
// Deposits require staking HEDGE in this gate
const HEDGE = '0x3f9108a3bECa998C14c6dda822a7e8EaEb88E20D'
const HEDGE_STAKING_GATE = '0x48ae41142bb0Ddd18DC49BD659b55207FAcE64d8'

async function tvl(api) {
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

module.exports = {
  methodology:
    "TVL counts what depositors own in each Stock Yield vault, read from the vault's managedBalances(): the stock token (active, queued for the next epoch, and redeemed but not yet claimed) plus earned premiums not yet claimed, in USDG. The option buyer's premium is counted once the epoch settles and it is credited to depositors; the protocol fee, the buyer's exercised stock and the separately funded exit pool are excluded. Staking counts HEDGE staked in the deposit gate.",
  start: 1791614176, // 2026-10-10 06:36:16 UTC, first vault's deployment block 84792706
  robinhood: {
    tvl,
    staking: staking(HEDGE_STAKING_GATE, HEDGE),
  },
}
