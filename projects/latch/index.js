const { sumTokens2 } = require('../helper/unwrapLPs');

const tvl = async (api) => {
  const depositPools = [
    '0xFE606EEc8Eb8e6Ad8E8654968a15650F5331a023',
    '0x7cC08f23a6E8222c86a62fCE3d4d252dd1b8f90C',
  ]

  const proxies = [
    '0xa116b4680b52973426B6D2a92DcC972b8DbcB46F',
    '0x97cA296139f114BF3040Cf05D05c240B770c627E'
  ]

  const tokens = await api.multiCall({ abi: 'address:ASSET_TOKEN', calls: depositPools })
  const stakingPools = await api.multiCall({ abi: 'address:treasury', calls: depositPools })
  const nextTreasuries = await api.multiCall({ abi: 'address:nextTreasury', calls: stakingPools })
  const withdrawPools = await api.multiCall({ abi: 'address:withdrawPool', calls: stakingPools })

  await sumTokens2({ api, tokens, owners: depositPools.concat(withdrawPools), })
  return sumTokens2({ api, tokens, owners: nextTreasuries.concat(stakingPools).concat(proxies), fetchCoValentTokens: true, tokenConfig: { onlyWhitelisted: false, } })
};

module.exports = {
  ethereum: {
    tvl,
  },
};