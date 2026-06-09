// Tokamak Network — TON seigniorage staking (Ethereum L1)
//
// Stakers delegate TON to operator (DAO candidate) contracts. The staked principal is
// custodied as WTON — a 27-decimal "ray" wrapped TON where 1 WTON == 1 TON in value —
// held by the DepositManager contract. We report the DepositManager's WTON balance as
// staked TON. TON is Tokamak Network's own token, so this is reported under `staking`.
const TON = '0x2be5e8c109e2197D077D13A82dAead6a9b3433C5' // ERC-20, 18 decimals
const WTON = '0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2' // Wrapped TON, 27 decimals (RAY)
const DEPOSIT_MANAGER = '0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e'

async function staking(api) {
  const wtonBalance = await api.call({ target: WTON, abi: 'erc20:balanceOf', params: DEPOSIT_MANAGER })
  // Convert 27-decimal WTON to 18-decimal TON (1 WTON == 1 TON) and price as TON.
  api.add(TON, (BigInt(wtonBalance) / 10n ** 9n).toString())
}

module.exports = {
  methodology:
    'TON staked through Tokamak Network seigniorage staking on Ethereum L1. Stakers delegate TON to operator (DAO candidate) contracts; the principal is custodied as WTON (27-decimal wrapped TON) in the DepositManager (0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e). Reported staking value is the DepositManager WTON balance expressed as TON (1 WTON = 1 TON).',
  ethereum: {
    tvl: () => ({}),
    staking,
  },
}
