module.exports = {
  misrepresentedTokens: true,
  sonic: { tvl }
}

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:totalSupply', target: '0xE5Fb2Ed6832deF99ddE57C0b9d9A56537C89121D' })
  api.addCGToken('sonic-bridged-usdc-e-sonic', supply / 1e18)
}