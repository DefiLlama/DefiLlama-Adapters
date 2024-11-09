const ADDRESSES = require('../helper/coreAssets.json')

const { queryAddresses, sumTokens } = require('../helper/chain/radixdlt');

const staking_pools = [
  'component_rdx1cqzle2pft0y09kwzaxy07maczpwmka9xknl88glwc4ka6a7xavsltd',
  'component_rdx1cpdpfn8q0650yh6stmxdwme4tp7m6lphngpqjazakehttq8aqenvhm',
  'component_rdx1crrxdzcq0cfpxvqk70e0usq8qusqz6g0ht6rylr4wgnxpflzjeaayy'
]

const lending_pools = [
  {
    pool: 'component_rdx1cq8mm5z49x6lyet44a0jd7zq52flrmykwwxszq65uzfn6pk3mvm0k4',
    resource: ADDRESSES.radixdlt.XRD,
    priceFeed: 'component_rdx1cz9u0svc4d2jtnkdqypxpcea8cj3da9vdqakrt748ackl82khfxv25'
  },
  {
    pool: 'component_rdx1cq7qd9vnmmu5sjlnarye09rwep2fhnq9ghj6eafj6tj08y7358z5pu',
    resource: 'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
    priceFeed: 'component_rdx1cz9u0svc4d2jtnkdqypxpcea8cj3da9vdqakrt748ackl82khfxv25',
  },
  {
    pool: 'component_rdx1cr5cnuzre63whe4yhnemeyvjj2yaq7tqg0j6q4xxtcyajf8rv0hw26',
    resource: 'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf',
    priceFeed: 'component_rdx1cptmek76m0xuw3etvdqttvgtcu99lvz84jh9q8zleaj3vc5elk4epc'
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

async function staking(api) {
  return sumTokens({ owners: staking_pools, api });
}

module.exports = {
  radixdlt: { tvl, borrowed, staking },
  timetravel: false,
};
