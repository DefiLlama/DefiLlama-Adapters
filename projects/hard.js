const { queryV1Beta1 } = require('./helper/chain/cosmos');
const chain = 'kava'

const tvl = async (_, _1, _2, { api }) => {
  const [deposited, borrowed] = await Promise.all([
    queryV1Beta1({ chain, url: 'hard/v1beta1/total-deposited' }),
    queryV1Beta1({ chain, url: 'hard/v1beta1/total-borrowed' })
  ])
  deposited.supplied_coins.forEach(({ denom, amount }) => {
    console.log("denom", denom, "amount", amount)
    api.add(denom, amount)
  })
  borrowed.borrowed_coins.forEach(({ denom, amount }) => {
    console.log("denom", denom, "amount", amount * -1)
    api.add(denom, amount * -1)
  })
}

module.exports = {
  timetravel: false,
  kava: {
    tvl,
  }
}
