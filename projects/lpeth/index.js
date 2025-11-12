
async function tvl(api) {
  const LPETH_CONTRACT = "0xF3a75E087A92770b4150fFF14c6d36FB07796252"
  const liabilities = await api.call({ abi: 'uint256:liabilities', target: LPETH_CONTRACT, })
  api.addGasToken(liabilities)
}

module.exports = {
  methodology: 'Counts the amount of deposited ETH in the LPETH contract.',
  doublecounted: true,
  ethereum: {
    tvl
  }
}