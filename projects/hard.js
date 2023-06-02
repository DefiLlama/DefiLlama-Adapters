const { queryV1Beta1 } = require('./helper/chain/cosmos');
const { transformBalances } = require('./helper/portedTokens')

const chain = 'kava'

const tvl = async (_, _1, _2, { api }) => {
  const [deposited, borrowed] = await Promise.all([
    queryV1Beta1({ chain, url: 'hard/v1beta1/total-deposited' }),
    queryV1Beta1({ chain, url: 'hard/v1beta1/total-borrowed' })
  ])
  deposited.supplied_coins.forEach(({ denom, amount }) => api.add(denom, amount, { skipChain: true }))
  borrowed.borrowed_coins.forEach(({ denom, amount }) => api.add(denom, amount * -1, { skipChain: true }))
  return transformBalances(chain, api.getBalances())
}



const borrowed = async (_, _1, _2, { api }) => {
  const borrowed = await queryV1Beta1({ chain, url: 'hard/v1beta1/total-borrowed' })
  borrowed.borrowed_coins.forEach(({ denom, amount }) => api.add(denom, amount, { skipChain: true }))
  return transformBalances(chain, api.getBalances())
}

module.exports = {
  timetravel: false,
  kava: {
    tvl,
    borrowed
  }
}
