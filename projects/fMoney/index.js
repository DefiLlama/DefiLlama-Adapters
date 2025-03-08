const { compoundExports2 } = require('../helper/compound')
const { unwrapBalancerToken } = require('../helper/unwrapLPs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
	fantom: {
    unitroller: '0xB911d8064c0AA338241f349eD802Ad4bae6ec034',
    stakingPool: '0x9426d9077620efaae688d3c3b398fa814406ce4a',
    stakingPoolEqualizer: '0xa45571a6b0861d3e4b26e0925ec2c8d9cf44dc3a',
    owner: '0x6B0B150A7a37b1E592F553E2b7D71d6D1439dc57',
    fbux: '0x1e2Ea3f3209D66647f959CF00627107e079B870d',
    fbuxPairedToken: '0x2f733095b80a04b38b0d10cc884524a3d09b836a',
    fbuxEQPairedToken: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  },
  sonic: {
    unitroller: '0xd41e9fa6EC7A33f0A6AAE5E9420c9D60eC1727e4',
    stakingPool: '0x3ec8254006658e11f9ab5eaf92d64f8528d09057',
    stakingPoolEqualizer: '0xc2c3beb4bceb9b37d2b4b5eea3b7810858b3b68c',
    owner: '0x748e5c88b586172692500f3415678c87842f8d3f',
    fbux: '0xd43b5d6899635e514A00b475eEa04C364979e076',
    fbuxPairedToken: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
    fbuxEQPairedToken: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
  }
}

async function staking(api) {
  const { fbux, stakingPool, stakingPoolEqualizer, owner, fbuxEQPairedToken } = config[api.chain]
  let balances = {}

  // Get balances from main staking pool
  await unwrapBalancerToken({
    api,
    balancerToken: stakingPool,
    owner,
  })

  // Get balances from equalizer pool if it exists
  if (stakingPoolEqualizer) {
    await sumTokens2({
      api,
      owners: [stakingPoolEqualizer],
      tokens: [fbux, fbuxEQPairedToken],
    })
  }

  balances = api.getBalances()
  return balances
}

Object.keys(config).forEach(chain => {
	module.exports[chain] = compoundExports2({ comptroller: config[chain].unitroller })
  module.exports[chain].staking = staking
})

module.exports.methodology = 'We count the FBUX token and its paired token in the beets pool and the equalizer pool if it exists.'