module.exports = {
  misrepresentedTokens: true,
  sonic: { tvl }
}

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:totalSupply', target: '0xc2896AA335BA18556c09d6155Fac7D76A4578c5A' })
  api.addCGToken('sonic-bridged-usdc-e-sonic', supply / 1e18)
}