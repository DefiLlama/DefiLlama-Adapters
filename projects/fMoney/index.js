const { compoundExports2 } = require('../helper/compound')
const { unwrapBalancerToken } = require('../helper/unwrapLPs')

const config = {
	fantom: {
    unitroller: '0xB911d8064c0AA338241f349eD802Ad4bae6ec034',
    stakingPool: '0x9426d9077620efaae688d3c3b398fa814406ce4a',
    owner: '0x6B0B150A7a37b1E592F553E2b7D71d6D1439dc57'
  },
  sonic: {
    unitroller: '0xd41e9fa6EC7A33f0A6AAE5E9420c9D60eC1727e4',
    stakingPool: '0x3ec8254006658e11f9ab5eaf92d64f8528d09057',
    owner: '0x44ece28720dbe441bbf1363e17b0cd71839090c8'
  }
}

async function staking(api) {
  await unwrapBalancerToken({
    api,
    balancerToken: config[api.chain].stakingPool,
    owner: config[api.chain].owner,
    isV2: true
  })
  return api.getBalances()
}

Object.keys(config).forEach(chain => {
	module.exports[chain] = compoundExports2({ comptroller: config[chain].unitroller })
  module.exports[chain].staking = staking
})