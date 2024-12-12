const ADDRESSES = require('../helper/coreAssets.json')

const { queryAddresses, sumTokens } = require('../helper/chain/radixdlt');

const pools = [
  {
    pool: 'component_rdx1cqasw720453g8pr2jc3nxq2h9rrv9cvfjy35q6jhskukqqs0t7qcky',
    resource: ADDRESSES.radixdlt.XRD,
  },
  {
    pool: 'component_rdx1cqz0f5znwhyy2d4q2rhncetm5tfpvu2c73kvfertktkw33drxcawk8',
    resource: 'resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw',
  },
  {
    pool: 'component_rdx1cp5hd3a2daw4vuzx0hywn56ur2pmat7nnytl5v3pv36xky5hkpr84y',
    resource: 'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
  },
  {
    pool: 'component_rdx1cr87dx5laxnffdkyv4fsrwms3m62vexgye9x9xpxyrv63gzpgwt97d',
    resource: ADDRESSES.radixdlt.WETH,
  },
  {
    pool: 'component_rdx1czuk76y4vhgd44sxly0un2tqegws670dqp0usl2tlsgfkhmdl8dad3',
    resource: 'resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97',
  },
  {
    pool: 'component_rdx1cqlfmwmhdmp0ln4gaera4skn3yz30p4k5ssv7lqflgh0rjeakwzs9f',
    resource: 'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
  },
  // Adding the LSULP Pool
  {
    pool: 'component_rdx1czmq3me09q7p7g7hgsyaqctfw3he4hl6ypg6em2h7nyd2umk0dhhnq',
    resource: 'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf',
  }
];

async function fetchData(addresses) {
  return await queryAddresses({ addresses });
}

async function tvl(api) {
  return sumTokens({ api, owners: pools.map((item) => item.pool) });
}

async function borrowed(api) {
  const [poolData,] = await Promise.all([
    fetchData(pools.map((item) => item.pool)),
  ]);


  pools.forEach((pool, i) => {
    const { details } = poolData.find((item) => item.address === pool.pool);
    api.add(pools[i].resource, Number(details.state.fields[1].value));
  });
}

module.exports = {
  radixdlt: { tvl, borrowed },
  timetravel: false,
};
