const NOTE = '0x7c6a937943F135283A2561938DE2200994a8f7a7'

const tvl = async (api) => {
  const supply = await api.call({ target: NOTE, abi: 'uint256:contractBalanceOf' })
  api.add(NOTE, supply)
}

module.exports = {
  avax: { tvl }
}