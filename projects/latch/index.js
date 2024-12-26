const { sumTokens2 } = require('../helper/unwrapLPs');

const tvl = async (api) => {
  const depositPools = [
    '0xFE606EEc8Eb8e6Ad8E8654968a15650F5331a023',
    '0x7cC08f23a6E8222c86a62fCE3d4d252dd1b8f90C',
  ]

  const tokens = await api.multiCall({ abi: 'address:ASSET_TOKEN', calls: depositPools })
  const stakingPools = await api.multiCall({ abi: 'address:treasury', calls: depositPools })
  const nextTreasuries = await api.multiCall({ abi: 'address:nextTreasury', calls: stakingPools })
  const withdrawPools = await api.multiCall({ abi: 'address:withdrawPool', calls: stakingPools })

  await sumTokens2({ api, tokens, owners: depositPools.concat(withdrawPools), })
  return sumTokens2({ api, tokens, owners: nextTreasuries.concat(stakingPools), fetchCoValentTokens: true, tokenConfig: { onlyWhitelisted: false, } })
};

module.exports = {
  ethereum: {
    tvl,
  },
};