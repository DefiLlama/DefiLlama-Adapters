const apETH = '0xAaAaAAaBC6CBc3A1FD3a0fe0FDec43251C6562F5'

async function tvl(api) {
  const supply = await api.call({ target: apETH, abi: 'uint256:totalSupply' })
  const multiplier = await api.call({ target: apETH, abi: 'uint256:ethPerAPEth' })
  api.addGasToken(supply * multiplier / 1e18)
}

module.exports = {
  doublecounted: true,
  methodology: 'Returns the ETH equivalent value of the total supply of apETH tokens on Ethereum. This is calculated by the multiplier used in the contract to determine the ETH value of each token when minting apETH.',
  start: 20937454,
  ethereum: {
    tvl,
  }
}