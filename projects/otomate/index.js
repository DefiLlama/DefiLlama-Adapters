const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

// Creation blocks from https://explorer.inkonchain.com/address/<vault>.
// Filter by block so refills before March 15 do not call undeployed vaults.
const vaults = [
  { address: '0x919C57BF59484798Ff2f90018640fd0A08242aC2', block: 39817878 }, // USDT0
  { address: '0x2baA4C3f66Fa6f0c2d56242BaAE446a4De878B98', block: 40073655 }, // kBTC
  { address: '0xcc7DcF43b17D8EdC437a6e33a6A325C57eba1ED7', block: 40073901 }, // WETH
  { address: '0x59046e5a0cbb5b64981b4668a31ab3a5ed0e7dd0', block: 40074036 }, // USDC
]

async function tvl(api) {
  const block = await api.getBlock()
  const activeVaults = vaults.filter(v => v.block <= block).map(v => v.address)
  if (!activeVaults.length) return {}
  return sumERC4626VaultsExport2({ vaults: activeVaults })(api)
}

module.exports = {
  start: '2026-03-12',
  methodology: 'Underlying assets in Otomate ERC-4626 vaults on Ink, measured with totalAssets net of accrued protocol fees. Assets are supplied to Tydro and already included in Tydro TVL.',
  doublecounted: true, // The same deposits are counted by the Tydro lending adapter.
  ink: { tvl },
}
