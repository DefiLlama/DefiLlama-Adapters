const FACTORY = '0xbBDC68D1f35c7Ca40C0Fa9ec24cAE8ee09B807Bb'

async function vesting(api) {
  const vaults = await api.fetchList({ target: FACTORY, lengthAbi: 'getPoolCount', itemAbi: 'getPoolAt' })
  const projectTokens = await api.multiCall({ abi: 'address:projectToken', calls: vaults })
  await api.sumTokens({ tokensAndOwners: vaults.map((v, i) => [projectTokens[i], v]) })
}

module.exports = {
  bsc: {
    tvl: () => ({}),
    vesting,
  },
}