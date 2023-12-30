async function tvl(_, _b, _cb, { api, }) {
  const contract = '0xad6250f0bd49f7a1eb11063af2ce9f25b9597b0f'
  const [bal, token] = await api.batchCall([
    { abi: 'uint256:assetsAvailable', target: contract },
    { abi: 'address:asset', target: contract },
  ])
  api.add(token, bal)
}

module.exports = {
  ethereum: { tvl },
}