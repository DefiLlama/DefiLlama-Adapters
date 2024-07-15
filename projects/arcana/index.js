module.exports = {
  misrepresentedTokens: true,
  real: { tvl }
}

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:circulatingSupply', target: '0xaec9e50e3397f9ddc635c6c429c8c7eca418a143' })
  api.addCGToken('tether', supply / 1e18)
}