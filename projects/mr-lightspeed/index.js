module.exports = {
  start: '2025-10-23',
  methodology: 'TVL counts ETH collateral locked in protocol-owned Uniswap v4 positions.',
  doublecounted: true,
  base: {
    tvl: () => ({}), // positions owned by EOA, moved to treasury 
  },
}
