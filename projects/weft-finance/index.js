const ADDRESSES = require('../helper/coreAssets.json')

const { queryAddresses } = require('../helper/chain/radixdlt');

const pools = [
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

async function fetchData(addresses) {
  return await queryAddresses({ addresses });
}

async function tvl(api) {
  const [poolData, priceData] = await Promise.all([
    fetchData(pools.map((item) => item.pool)),
    fetchData(pools.map((item) => item.priceFeed)),
  ]);

  const prices = priceData.map((item) => item.details.state.fields[0].entries).flat();

  let totalValueLocked = 0;

  pools.forEach((pool) => {
    const { fungible_resources } = poolData.find((item) => item.address === pool.pool);
    const priceData = prices.find((price_item) => price_item.key.value === pool.resource);

    const price = priceData ? +priceData.value.fields[1].value : 1;
    totalValueLocked += ++fungible_resources.items[0].amount * price;
  });

  return { 'radix': totalValueLocked };
}

async function borrowed(api) {
  const [poolData, priceData] = await Promise.all([
    fetchData(pools.map((item) => item.pool)),
    fetchData(pools.map((item) => item.priceFeed)),
  ]);

  const prices = priceData.map((item) => item.details.state.fields[0].entries).flat();

  let borrowedValue = 0;

  pools.forEach((pool) => {
    const { details } = poolData.find((item) => item.address === pool.pool);
    const priceData = prices.find((price_item) => price_item.key.value === pool.resource);

    const priceInXRD = priceData ? +priceData.value.fields[1].value : 1;
    borrowedValue += +details.state.fields[1].value * priceInXRD;
  });

  return { 'radix': borrowedValue };
}

module.exports = {
  radixdlt: { tvl, borrowed },
  timetravel: false,
  misrepresentedTokens: true,
};
