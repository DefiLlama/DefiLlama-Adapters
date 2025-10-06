const ADDRESSES = require('../helper/coreAssets.json');
const { queryAddresses, sumTokens } = require('../helper/chain/radixdlt');

const LSU_LP =
  'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf';

const pools = [
  {
    pool: 'component_rdx1cqasw720453g8pr2jc3nxq2h9rrv9cvfjy35q6jhskukqqs0t7qcky',
    resource: ADDRESSES.radixdlt.XRD,
  },
  {
    pool: 'component_rdx1cqz0f5znwhyy2d4q2rhncetm5tfpvu2c73kvfertktkw33drxcawk8',
    resource:
      'resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw',
  },
  {
    pool: 'component_rdx1cp5hd3a2daw4vuzx0hywn56ur2pmat7nnytl5v3pv36xky5hkpr84y',
    resource:
      'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
  },
  {
    pool: 'component_rdx1cr87dx5laxnffdkyv4fsrwms3m62vexgye9x9xpxyrv63gzpgwt97d',
    resource: ADDRESSES.radixdlt.WETH,
  },
  {
    pool: 'component_rdx1czuk76y4vhgd44sxly0un2tqegws670dqp0usl2tlsgfkhmdl8dad3',
    resource:
      'resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97',
  },
  {
    pool: 'component_rdx1cqlfmwmhdmp0ln4gaera4skn3yz30p4k5ssv7lqflgh0rjeakwzs9f',
    resource:
      'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
  },
  // LSULP Pool
  {
    pool: 'component_rdx1czmq3me09q7p7g7hgsyaqctfw3he4hl6ypg6em2h7nyd2umk0dhhnq',
    resource: LSU_LP,
  },
  // WOWO Pool
  {
    pool: 'component_rdx1crsgd3yqvfh49599yrfpw08ezjwjuns04970mz2l4dnyxxhwzuecy5',
    resource:
      'resource_rdx1t4kc5ljyrwlxvg54s6gnctt7nwwgx89h9r2gvrpm369s23yhzyyzlx',
  },
  // EARLY Pool
  {
    pool: 'component_rdx1cr0pr68zxqvmfq2whn4nh22qcg2q5skdm7lt3qwvm6nfr2ccaryjsz',
    resource:
      'resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s',
  },
  // hUSDT Pool
  {
    pool: 'component_rdx1czu2zdxwzshf00cqp2ualtd4nw6drys64xs9c7s60m5yrjmdtug7xl',
    resource:
      'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
  },
  // hUSDC Pool
  {
    pool: 'component_rdx1cprk3jw75hra9mepvxn9kzekp83juvxcqrt5exhs83f0ys6f64ty0y',
    resource:
      'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
  },
  // hETH Pool
  {
    pool: 'component_rdx1cz3u030hl5hmfuhw3u75x4cn83latha5ge5gfnl27lft8dnuk7am06',
    resource:
      'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
  },
  // hWBTC Pool
  {
    pool: 'component_rdx1cr7yt0hct6zwvldg4q6jjjk3yswzs4rut0wzqx8al3kaaa3dzf7a7d',
    resource:
      'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
  },
];

async function fetchData(addresses) {
  return await queryAddresses({ addresses });
}

async function tvl(api) {
  await sumTokens({ api, owners: pools.map((p) => p.pool) });
}

async function borrowed(api) {
  const [poolData] = await Promise.all([fetchData(pools.map((p) => p.pool))]);

  pools.forEach((pool, i) => {
    const { details } = poolData.find((item) => item.address === pool.pool);
    api.add(pool.resource, Number(details.state.fields[1].value));
  });
}

module.exports = {
  radixdlt: { tvl, borrowed },
  timetravel: false,
  misrepresentedTokens: true,
};
