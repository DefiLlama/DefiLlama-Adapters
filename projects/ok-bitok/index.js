const VAULT = '0xD772A28caf98cCF3c774c704cA9514A4914b50A0'
const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' // Arbitrum native USDC

async function tvl(api) {
  const nav = await api.call({
    target: VAULT,
    abi: 'function tvl() view returns (uint256)',
  })

  api.add(USDC, nav)
}

module.exports = {
  methodology: 'TVL equals onchain NAV (USDC) returned by the vault contract tvl() function. Deposits and withdrawals are executed onchain via the vault contract.',
  arbitrum: {
    tvl,
  },
}
