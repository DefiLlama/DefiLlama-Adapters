const USTY = '0x3553bd00ee45749ea939f9d9b8d713bbbccb62f3'

const tvl = async (api) => {
  const supply = await api.call({ target: USTY, abi: 'erc20:totalSupply' })
  const decimals = await api.call({ target: USTY, abi: 'erc20:decimals' })
  api.addUSDValue(supply / 10 ** decimals)
}

module.exports = {
  xdc : { tvl }
}