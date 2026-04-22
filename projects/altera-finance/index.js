const POOLINFO = '0x744EaA81544E940F054AC1931025f1B6D26f2FDE';

async function tvl(api) {
  const res = await api.call({ target: POOLINFO, abi:  "function getAllPoolsTVL() view returns ((address token, uint8 decimals, uint256 amount)[])"})
  res.forEach(i => api.add(i.token, i.amount))
}

module.exports = {
  start: 1776849595,
  ethereum: {
    tvl
  }
}
