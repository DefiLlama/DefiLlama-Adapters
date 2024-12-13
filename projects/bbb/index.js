const BBB = '0xfa4ddcfa8e3d0475f544d0de469277cf6e0a6fd1'

const tvl = async (api) => {
  const supply = await api.call({ target: BBB, abi: 'erc20:totalSupply' })
  api.add(BBB, supply)
}

module.exports = {
  xdc: { tvl }
}