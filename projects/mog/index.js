const ADDRESSES = require('../helper/coreAssets.json')

// MogCore custodies every USDG the venue holds: trader balances, margin in
// escrow and the treasury. Fee accruals to the buyback and operator payees
// are junior claims paid only from surplus, so they are not netted out.
const MOG_CORE = '0x11C0C0007abeD9eF5dFa3dF1d726B4FD271C52EA'

async function tvl(api) {
  const USDG = ADDRESSES.robinhood.USDG
  const held = await api.call({ target: USDG, abi: 'erc20:balanceOf', params: [MOG_CORE] })
  api.add(USDG, held)
}

module.exports = {
  methodology:
    'TVL is the USDG held by the MogCore contract: trader balances, trader margin in escrow, ' +
    'and the venue treasury. MOG tokens are not counted.',
  start: '2026-09-18',
  robinhood: { tvl },
}
