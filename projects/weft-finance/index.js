const { queryAddresses } = require('../helper/chain/radixdlt');

const pools = [
  'component_rdx1cq8mm5z49x6lyet44a0jd7zq52flrmykwwxszq65uzfn6pk3mvm0k4',
  'component_rdx1cq7qd9vnmmu5sjlnarye09rwep2fhnq9ghj6eafj6tj08y7358z5pu',
  'component_rdx1cr5cnuzre63whe4yhnemeyvjj2yaq7tqg0j6q4xxtcyajf8rv0hw26',
]

async function tvl(_, _b, _cb, { api, }) {
  const data = await queryAddresses({ addresses: pools })

  data.forEach((item) => {
    api.add(item.fungible_resources.items[0].resource_address, +item.fungible_resources.items[0].amount)
  })

  return api.getBalances()
}

async function borrowed(_, _b, _cb, { api, }) {
  const data = await queryAddresses({ addresses: pools })

  data.forEach((item) => {
    api.add(item.fungible_resources.items[0].resource_address, +item.details.state.fields[1].value)
  })

  return api.getBalances()
}

module.exports = {
  radixdlt: { tvl, borrowed },
  timetravel: false
}
