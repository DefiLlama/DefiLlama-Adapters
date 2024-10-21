const ADDRESSES = require('../helper/coreAssets.json')

const { queryAddresses } = require('../helper/chain/radixdlt');

const pools = [
  {
    pool: 'component_rdx1cqasw720453g8pr2jc3nxq2h9rrv9cvfjy35q6jhskukqqs0t7qcky',
    resource: ADDRESSES.radixdlt.XRD,
    priceFeed: 'component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98'
  },
  {
    pool: 'component_rdx1cqz0f5znwhyy2d4q2rhncetm5tfpvu2c73kvfertktkw33drxcawk8',
    resource: 'resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw',
    priceFeed: 'component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98',
  },
  {
    pool: 'component_rdx1cp5hd3a2daw4vuzx0hywn56ur2pmat7nnytl5v3pv36xky5hkpr84y',
    resource: 'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
    priceFeed: 'component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98'
  },
  {
    pool: 'component_rdx1cr87dx5laxnffdkyv4fsrwms3m62vexgye9x9xpxyrv63gzpgwt97d',
    resource: 'resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww',
    priceFeed: 'component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98'
  },
  {
    pool: 'component_rdx1czuk76y4vhgd44sxly0un2tqegws670dqp0usl2tlsgfkhmdl8dad3',
    resource: 'resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97',
    priceFeed: 'component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98',
  },
  {
    pool: 'component_rdx1cqlfmwmhdmp0ln4gaera4skn3yz30p4k5ssv7lqflgh0rjeakwzs9f',
    resource: 'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
    priceFeed: 'component_rdx1cr9alunsmm5c42275fh0rh3kvqfupdhlf84tnkawspq6as7cysqn98'
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

  console.log(poolData[0].fungible_resources)

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
