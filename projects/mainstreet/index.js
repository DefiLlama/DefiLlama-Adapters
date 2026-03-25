module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl }
}

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:totalSupply', target: '0x4ba01f22827018b4772CD326C7627FB4956A7C00' })
  api.addCGToken('usd-coin', supply / 1e18)
}
