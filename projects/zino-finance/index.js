const POOLINFO = '0xebb35Da2A36bEfF4b443DB0A89637c40dF00AFcF';

async function tvl(api) {
  const res = await api.call({ target: POOLINFO, abi:  "function getTotalValueLockedList() view returns ((address token, uint8 decimals, uint256 amount)[])"})
  res.forEach(i => api.add(i.token, i.amount))
}

module.exports = {
  start: 1741132619,
  arbitrum: {
    tvl
  }
}
