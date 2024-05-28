async function tvl(api) {
  api.addGasToken(await api.call({target: '0x45334a5b0a01ce6c260f2b570ec941c680ea62c0', abi: 'uint256:getTotalPooledZETA'}))
  
}

module.exports = { zeta: { tvl } }