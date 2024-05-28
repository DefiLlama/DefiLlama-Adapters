
async function tvl(api) {
  const pooledFTN = await api.call({ target: '0x780Fb5AcA83F2e3F57EE18cc3094988Ef49D8c3d', abi: "uint256:getTotalPooledFtn" })

  return {
    'coingecko:fasttoken': pooledFTN / 1e18,
  }
}

module.exports = {
  methodology: 'Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued',
  ftn: { tvl },
}
