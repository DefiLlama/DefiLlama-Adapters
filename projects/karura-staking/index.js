const { staking } = require('../helper/acala/liquidStaking')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  karura: { tvl: () => staking('karura') },
}
