const ADDRESSES = require('../helper/coreAssets.json')

const { queryAddresses, sumTokens } = require('../helper/chain/radixdlt');

const lending_pools = [
  {
    pool: 'component_rdx1cq8mm5z49x6lyet44a0jd7zq52flrmykwwxszq65uzfn6pk3mvm0k4',
    resource: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd'
  },
  {
    pool: 'component_rdx1cq7qd9vnmmu5sjlnarye09rwep2fhnq9ghj6eafj6tj08y7358z5pu',
    resource: 'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf'
  },
  {
    pool: 'component_rdx1cr5cnuzre63whe4yhnemeyvjj2yaq7tqg0j6q4xxtcyajf8rv0hw26',
    resource: 'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf'
  }
]

async function tvl(api) {
  return sumTokens({ owners: lending_pools.map((pool_data) => pool_data.pool), api });
}

async function borrowed(api) {
  const poolData = await queryAddresses({ addresses: lending_pools.map((item) => item.pool) });

  lending_pools.forEach((pool) => {
    const { details } = poolData.find((item) => item.address === pool.pool);
    api.add(pool.resource, +details.state.fields[1].value)
  });
}

module.exports = {
  radixdlt: { tvl, borrowed },
  timetravel: false,
};
