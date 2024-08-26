const { getTokenBalance } = require('./helper/chain/near');

const GRID_CONTRACT_ID = 'grid.deltatrade.near';
const DCA_CONTRACT_ID = 'dca.deltatrade.near';

const tokenMapping = {
  'wrap.near': {
    name: 'near',
    decimals: 24,
  },
  '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': {
    name: 'usd-coin',
    decimals: 6,
  },
  'token.v2.ref-finance.near': {
    name: 'ref-finance',
    decimals: 18,
  },
  'token.burrow.near': {
    name: 'burrow',
    decimals: 18,
  },
  'token.lonkingnearbackto2024.near': {
    name: 'lonk-on-near',
    decimals: 8,
  },
  'blackdragon.tkn.near': {
    name: 'black-dragon',
    decimals: 24,
  },
  'ftv2.nekotoken.near': {
    name: 'neko',
    decimals: 24,
  },
  // "dragonsoultoken.near": {
  //     "decimals": 18
  // },
  'gear.enleap.near': {
    name: 'near-tinker-union-gear',
    decimals: 18,
  },
  // "nearnvidia.near": {
  //     "decimals": 8
  // },
  // "bean.tkn.near": {
  //     "decimals": 18
  // },
  'token.0xshitzu.near': {
    name: 'shitzu',
    decimals: 18,
  },
  //   "slush.tkn.near": {
  //       "decimals": 18
  //   },
  'marmaj.tkn.near': {
    name: 'marmaj',
    decimals: 18,
  },
  'edge-fast.near': {
    name: 'edge-video-ai',
    decimals: 24,
  },
  '802d89b6e511b335f05024a65161bce7efc3f311.factory.bridge.near': {
    name: 'linear-protocol-lnr',
    decimals: 18,
  },
  //   "hat.tkn.near": {
  //       "decimals": 18
  //   }
};

async function tvl() {
  const balances = {};

  for (const token of Object.keys(tokenMapping)) {
    const tokenName = tokenMapping[token].name;
    if (!tokenName) continue;
    const [grid, dca] = await Promise.all([
      getTokenBalance(token, GRID_CONTRACT_ID),
      getTokenBalance(token, DCA_CONTRACT_ID),
    ]);
    const decimals = tokenMapping[token].decimals;
    const balance = grid / 10 ** decimals + dca / 10 ** decimals;
    balances[tokenName] = balance;
  }

  return balances;
}

module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
};
