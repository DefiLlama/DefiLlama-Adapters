const contracts = {
  stKAIA: '0x42952B873ed6f7f0A7E4992E2a9818E3A9001995',
  node: '0x7949597f453592B782EC9036Af27d63Ed9774b2d',
}

async function tvl(api) {
  const tvl = await api.call({ target: contracts.node, abi: "uint256:getTotalClaimable" })
  api.addGasToken(tvl)
}

module.exports = {
	klaytn: { tvl }
}