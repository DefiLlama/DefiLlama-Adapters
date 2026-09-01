const { getAPI, } = require('./api')


const getTotalStaking = async (api) => {
  const toBond = await api.query.homa.toBondPool();
  const stakingLedgers = await api.query.homa.stakingLedgers.entries();
  let totalInSubAccount = 0;

  stakingLedgers.map(item => {
    const ledge = item[1].unwrapOrDefault();
    totalInSubAccount += +ledge.bonded.unwrap()
  })

  return +toBond + +totalInSubAccount
}

async function staking(chain) {
  const api = await getAPI(chain)

  const total = await getTotalStaking(api)
  if (chain === 'acala')
    return {
      polkadot: +total / 1e10,
    }
  return {
    kusama: +total / 1e12,
  }
}

module.exports = {
  staking,
  getTotalStaking,
}