const ADDRESSES = require('../helper/coreAssets.json')

const stBBAddress = '0x22aAC17E571D6651880d057e310703fF4C7c3483'
const stakeSTBBAddress = '0xFc7d97E14B9Fc2b2Bcc514F868f2729C386A91c8'

async function tvl(api) {
  const totalStakeSTBBShares = await api.call({abi: 'uint256:totalSupply', target: stakeSTBBAddress})
  const totalStakeSTBBAmount=  await api.call({abi: 'function getPooledNativeByShares(uint256) view returns (uint256 amount)', target: stBBAddress, params: [totalStakeSTBBShares]})
  // stbb -> bb 
  api.add(ADDRESSES.null, totalStakeSTBBAmount)
}

module.exports = {
  bouncebit: {
    tvl: () => ({}),
    staking: tvl,
  }
}