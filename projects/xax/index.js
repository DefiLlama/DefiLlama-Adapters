// DeFiLlama TVL adapter — XAX (XAUSD ERC-4626 vault), Ethereum mainnet.

const VAULT = '0xc452B6D5bf3a7712A9AF9F70BF32f37A531ff220'
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const OWNERS = [VAULT]

async function tvl(api) {
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    target: USDT,
    calls: OWNERS,
  })
  const total = balances.reduce((sum, bal) => sum + BigInt(bal), 0n)
  return { [USDT]: total.toString() }
}

module.exports = {
  methodology:
    'Counts USDT backing the XAUSD ERC-4626 vault that is held on-chain — USDT ' +
    'in the vault contract (idle reserve plus pending-redemption reservations). ' +
    'USDT held in off-chain MPC custody is excluded, so reported TVL can be ' +
    "lower than the vault's net asset value.",
  start: 1780980761,
  ethereum: { tvl },
}
