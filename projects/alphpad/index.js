const alephium = require('../helper/chain/alephium')

const Addresses = {
  apad: '27HxXZJBTPjhHXwoF1Ue8sLMcSxYdxefoN2U6d8TKmZsm',
  alphApadPool: 'vFpZ1DF93x1xGHoXM8rsDBFjpcoSsCi5ZEuA5NG5UJGX',
  alphUsdtPool: '2A5R8KZQ3rhKYrW7bAS4JTjY9FCFLJg6HjQpqSFZBqACX',
  vault: 'yzoCumd4Fpi959NSis9Nnyr28UkgyRYqrKBgYNAuYj3m'
}

async function apadLocked() {
  const results = await alephium.contractMultiCall([
    { group: 0, address: Addresses.vault, methodIndex: 34 },
    { group: 0, address: Addresses.alphApadPool, methodIndex: 8 },
    { group: 0, address: Addresses.alphUsdtPool, methodIndex: 8 },
  ]);
  const apadLocked = results[0].returns[0].value;
  const apadInAlph = results[1].returns[0].value / results[1].returns[1].value;
  const alphInUsd = (results[2].returns[1].value * 10 ** 12) / results[2].returns[0].value;
  return ((apadLocked / 10 ** 18) * apadInAlph) * alphInUsd;
}

async function staking(api) {
  const apadLockedValue = await apadLocked();
  api.addCGToken('tether', apadLockedValue)
}


module.exports = {
  timetravel: false,
  methodology: 'TVL locked in the APAD on Alephium',
  alephium: {
    tvl: () => ({}),
    staking
  }
}
