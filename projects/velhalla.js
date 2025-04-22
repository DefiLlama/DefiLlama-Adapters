const { staking } = require('./helper/staking')

module.exports = {
  velas: {
    tvl: () => ({}),
    staking: staking('0x7DeD7f9D3dF541190F666FB6897483e46D54e948', '0x8d9fb713587174ee97e91866050c383b5cee6209'),
  },
}