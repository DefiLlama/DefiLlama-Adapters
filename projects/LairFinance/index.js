const contracts = {
  stKAIA: '0x42952B873ed6f7f0A7E4992E2a9818E3A9001995',
  rstKAIA: '0xd05fCB2d4c427232C3b36a33E21a4F23810A298F',
  nodeController: '0x7949597f453592B782EC9036Af27d63Ed9774b2d',
}

async function kaia_tvl(api) {
  const tvl = await api.call({ target: contracts.nodeController, abi: "uint256:getTotalClaimable" })
  const rstKAIATotalSupply = await api.call({ target: contracts.rstKAIA, abi: "erc20:totalSupply" })

  api.addGasToken(tvl)
  api.add(contracts.rstKAIA, rstKAIATotalSupply)
}

module.exports = {
	klaytn: { tvl: kaia_tvl }
}