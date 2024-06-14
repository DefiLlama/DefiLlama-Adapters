const { getAPI } = require('./api')


async function staking(chain) {
  const api = await getAPI(chain)
  const data = await api.query.tokens.totalIssuance( { LiquidCrowdLoan: '13' } )

  return  {
    polkadot: data/1e10
  }
}

module.exports = {
  staking,
}