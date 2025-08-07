const contracts = {
  stKAIA: '0x42952B873ed6f7f0A7E4992E2a9818E3A9001995',
  rstKAIA: '0xd05fCB2d4c427232C3b36a33E21a4F23810A298F',
  LAIR: '0xD70C7D511560493C79DF607076fB863f5c8A50b0',
  nodeController: '0x7949597f453592B782EC9036Af27d63Ed9774b2d',
  restakingManager: '0x66611Ba2aa5deB46e6138aD21a202b40ecE5b6AB'
}

async function kaia_tvl(api) {
  const tvl = await api.call({ target: contracts.nodeController, abi: "uint256:getTotalClaimable" })
  const rstKAIATotalSupply = await api.call({ target: contracts.rstKAIA, abi: "erc20:totalSupply" })
  const lairPairRate = await api.call({ target: contracts.restakingManager, abi: "uint256:pairRate" })
  const restakedLairAmount = rstKAIATotalSupply * lairPairRate / (10 ** 18)

  api.addGasToken(tvl)
  api.add(contracts.LAIR, restakedLairAmount)
}

module.exports = {
	klaytn: { tvl: kaia_tvl }
}