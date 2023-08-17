const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  krest: {
    tvl: async () => {
	  const { krest } = getExports("krest-staking", ['krest'])
	  const tvl = await krest.tvl()
	  return { 'krest': tvl['KRST'], }
	}
  },
};
