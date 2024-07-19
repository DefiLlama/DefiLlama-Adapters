async function tvl(api) {
  let contract = '0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a'
  if (api.chain === 'arbitrum') contract = '0xF84D28A8D28292842dD73D1c5F99476A80b6666A'
  const [bal, token] = await api.batchCall([
    { abi: 'uint256:totalAssets', target: contract },
    { abi: 'address:underlying', target: contract },
  ])
  api.add(token, bal)
}

module.exports = {
  ethereum: { tvl },
  arbitrum: { tvl },
}