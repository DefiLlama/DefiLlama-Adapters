const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

// Setsuna Earn vaults on Monad: ERC-4626 vaults that supply lending markets by fixed on-chain rules.
const vaults = [
  '0x0a531817EEFB7b1FFD7c511c0817F58ac343CC67', // setsUSDC: Aave, Morpho, Euler, Neverland, Curvance
  '0x408A8C85a3e15446885ADCc954575e7a918dFd33', // setsMON (WMON): Neverland, Euler
]

module.exports = {
  methodology: 'TVL is the totalAssets() of the setsUSDC and setsMON vaults: assets supplied to the underlying lending markets plus idle cash held for withdrawals. Those assets are also counted by the lending markets themselves, so the protocol is marked double counted.',
  doublecounted: true,
  start: '2026-10-11',
  monad: { tvl: sumERC4626VaultsExport2({ vaults }) },
}
