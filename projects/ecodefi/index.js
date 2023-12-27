const { staking } = require('../helper/staking')
const { compoundExports2 } = require('../helper/compound')

module.exports = {
  methodology: 'counts the number of Total value locked in ESG protocol.',
  bsc: {
    ...compoundExports2({ comptroller: '0xfd1f241ba25b8966a14865cb22a4ea3d24c92451'}),
    staking: staking('0x55839fe60742c7789DaBcA85Fd693f1cAbaeDd69', '0x0985205D53D575CB07Dd4Fba216034dc614eab55'),
  },
  start: 15307794, // Feb-16-2022 01:49:31 PM +UTC
}
