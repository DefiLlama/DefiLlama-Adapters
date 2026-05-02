const POOLINFO = '0x5072fF50B5ad5ED1Fe87b934cbFdB679394E1B1a';

async function tvl(api) {
  const res = await api.call({ target: POOLINFO, abi:  "function getAllPoolsTVL() view returns ((address token, uint8 decimals, uint256 amount)[])"})
  res.forEach(i => api.add(i.token, i.amount))
}

module.exports = {
  start: 1777746061,
  ethereum: {
    tvl
  }
}
