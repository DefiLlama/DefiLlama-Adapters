const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require('../helper/treasury')

// Credence (credence.pfwa.fun, part of PFWA) on Robinhood Chain.
// The Credence Safe owns the launchers and is the CreatorFeeVaultFactory's protocolRecipient, so it receives the
// protocol's cut of creator vault fees. Launch fees stay in the launcher contracts until their owner withdraws them, so
// those balances are counted too.
const CREDENCE_SAFE = '0x85eb79DBCc50eB3DA0Ee10460109991E863d2666'
const LAUNCHERS = [
  '0x6EF3e8b1291463434850fb6ED466858A043D8525', // CredenceLauncherV2, owned by the Safe
  '0x0903EB2fBccf7bF9eC86b4cb2894A7a9E5Adab5c', // CreatorLauncher, owned by the Safe
  '0x69CD45c4d89CA8Cfe37c2ED1F869306e031d58F9', // 18 Sep 2026 rehearsal launcher, retired, owned by the Safe
  '0xdF2eBF0bc156880BbE03d8eD330B2A2431d74019', // CredenceDeployer (v1 launcher), owned by the PFWA team wallet
]

module.exports = treasuryExports({
  robinhood: {
    owners: [CREDENCE_SAFE, ...LAUNCHERS],
    tokens: [nullAddress, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG],
  },
})
