async function tvl(_, _b, _cb, { api, }) {
  const contract = '0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a'
  const [bal, token] = await api.batchCall([
    { abi: 'uint256:totalAssets', target: contract },
    { abi: 'address:underlying', target: contract },
  ])
  api.add(token, bal)
}

module.exports = {
  ethereum: { tvl },
}