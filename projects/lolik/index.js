const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const pooledFTN = await api.call({ target: ADDRESSES.ftn.stFTN, abi: "uint256:getTotalPooledFtn" })

  return {
    'coingecko:fasttoken': pooledFTN / 1e18,
  }
}

module.exports = {
  methodology: 'Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued',
  ftn: { tvl },
}
