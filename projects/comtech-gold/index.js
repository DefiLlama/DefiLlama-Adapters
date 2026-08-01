const CGO = '0x8f9920283470f52128bf11b0c14e798be704fd15'

const tvl = async (api) => {
  const supply = await api.call({ target: CGO, abi: 'erc20:totalSupply' })
  api.add(CGO, supply)
}

module.exports = {
  xdc: { tvl }
}