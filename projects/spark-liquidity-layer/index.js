const sparkLiquidityLayer = '0x1601843c5E9bC251A3272907010AFa41Fa18347E'
const tokens = [
  '0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041', // BUIDL-I
  '0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e', // USTB
  '0x8c213ee79581Ff4984583C6a801e5263418C4b86', // JTSRY
  '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b', // syrupUSDC
]

async function tvl(api) {
  const balanceCalls = tokens.map((token) => ({ target: token, params: sparkLiquidityLayer }))
  const tokenBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls })

  tokenBalances.forEach((balance, i) => {
    api.add(tokens[i], balance)
  })
}

module.exports = {
  ethereum: {
    tvl
  }
}
