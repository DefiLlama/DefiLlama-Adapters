const ADDRESSES = require('../helper/coreAssets.json')

// MogCore custodies every USDG the venue holds: trader balances, margin in
// escrow and the treasury. Unpaid fee accruals to the buyback and operator payees
// are junior claims paid only from surplus, so they are not netted out.
const MOG_CORE = '0x11C0C0007abeD9eF5dFa3dF1d726B4FD271C52EA'
// operator Safe, recipient of every OpenFeeReleased; no getter on MogCore
const OPERATOR = '0x67F9061efcE4e9BbD12e7De74debBE0896823bc6'

async function tvl(api) {
  const USDG = ADDRESSES.robinhood.USDG
  const held = await api.call({ target: USDG, abi: 'erc20:balanceOf', params: [MOG_CORE] })
  const buyback = await api.call({ target: MOG_CORE, abi: 'address:buyback' })
  const fees = await api.multiCall({ target: MOG_CORE, abi: 'function free(address) view returns (uint256)', calls: [OPERATOR, buyback] })
  // free() is 18-decimal wad, USDG has 6 decimals
  const paidFees = fees.reduce((sum, f) => sum + BigInt(f), 0n) / 10n ** 12n
  api.add(USDG, BigInt(held) - paidFees)
}

module.exports = {
  methodology:
    'TVL is the USDG held by the MogCore contract: trader balances, trader margin in escrow, ' +
    'and the venue treasury. Fees already paid out to the operator and buyback wallets but not yet withdrawn are excluded. MOG tokens are not counted.',
  start: '2026-09-19', // MogCore deployed 2026-09-18 11:46 UTC
  robinhood: { tvl },
}
