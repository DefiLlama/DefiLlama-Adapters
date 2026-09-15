// DeFiLlama TVL adapter for XAX (XAUSD ERC-4626 vault), Ethereum mainnet.
//
// Copy this file to projects/xax/index.js in a fork of
// DefiLlama/DefiLlama-Adapters and open a PR (see ./README.md).
//
// Count actual USDT in the vault,
// less deferred treasury fees. Queued shares stay backed until assets are paid.
// Vault totalAssets/reportedNav and MPC totalAssets/currentDebt include reported
// strategy value, so they cannot measure onchain custody. Do not add them.
// Strategy balances, including local MPC reserves, are outside this scope.
//
// Addresses are sourced from contracts/deployments/mainnet.json in the xax
// repo. Update them here if the vault is redeployed.

const VAULT = '0xd3dCB074C007DeB82b511E263d15966A05E6ef92'
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

function rawAmount(value) {
  if ((typeof value !== 'string' && typeof value !== 'bigint') || !/^\d+$/.test(value)) {
    throw new Error('Invalid raw USDT amount')
  }
  return BigInt(value)
}

async function tvl(api) {
  // Pin recent/latest runs too, so a fee payout cannot mix cash and liability states.
  await api.getBlock()
  const [balance, pendingTreasuryFee] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf', target: USDT, params: [VAULT] }),
    api.call({ abi: 'uint256:pendingTreasuryFee', target: VAULT }),
  ])
  const backing = rawAmount(balance) - rawAmount(pendingTreasuryFee)
  return { [USDT]: (backing > 0n ? backing : 0n).toString() } // raw 6-dec USDT
}

module.exports = {
  methodology:
    'Counts onchain USDT held by the XAUSD vault contract, ' +
    'less pending treasury fees. Queued redemptions remain included until paid. ' +
    'All strategy balances, including MPC adapter reserves and external custody, are excluded.',
  start: 1787306267, // V2 mainnet deploy block 25802758, 2026-08-21T09:57:47Z
  ethereum: { tvl },
}
