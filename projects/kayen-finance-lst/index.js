// Kayen Finance LST: liquid staking of native CHZ on Chiliz.
//
// stCHZ is an exchange-rate token rather than a rebasing one, so balances are fixed
// shares and the rate rises as validator rewards compound. The CHZ backing those
// shares is held by the depositor, which delegates it to the Chiliz validator set,
// so totalDeposits() is the single source of truth for TVL: staked principal,
// accrued rewards net of the protocol fee, amounts still undelegating and the idle
// balance, less the CHZ already reserved for pending withdrawals.
//
// https://chiliscan.com/address/0xc3cbf2c6b3ea81f1A8a9fd24D8179B6F39860DB7
const CHILIZ_DEPOSITOR = '0xc3cbf2c6b3ea81f1A8a9fd24D8179B6F39860DB7'

async function tvl(api) {
  const totalDeposits = await api.call({ target: CHILIZ_DEPOSITOR, abi: 'uint256:totalDeposits' })
  api.addGasToken(totalDeposits)
}

module.exports = {
  methodology: 'Counts the CHZ staked through Kayen Finance LST, read from ChilizDepositor.totalDeposits(): the pooled CHZ backing stCHZ, covering staked principal, accrued rewards, amounts still undelegating and the idle balance, excluding CHZ reserved for pending withdrawals.',
  chz: { tvl },
}
