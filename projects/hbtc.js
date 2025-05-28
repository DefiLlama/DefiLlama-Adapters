async function tvl(api) {
  const hbtc = '0x0316EB71485b0Ab14103307bf65a021042c6d380'
  const supply = await api.call({  abi: 'erc20:totalSupply', target: hbtc })
  api.add(hbtc, supply)
}

module.exports = {
  ethereum: { tvl }
}
