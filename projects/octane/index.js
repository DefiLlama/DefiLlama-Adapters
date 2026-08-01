const { pool2s } = require('../helper/pool2')
const { stakings } = require('../helper/staking')

async function tvl(api) {
  const owner = '0x563AF5Db2Ad4d22A9807D65F14aE88F71101A2bd'
  const tokens = [
    '0x95c78222b3d6e262426483d42cfa53685a67ab9d', // vBUSD
    '0xa07c5b74c9b40447a954e1466938b865b6bbea36', // vBNB
  ]
  return api.sumTokens({ owner, tokens})
}

module.exports = {
  methodology: "Add all the tokens in the orderbook contract",
  bsc: {
    tvl,
    pool2: pool2s(['0x8459d87618e45dc801bc384ea60596ddb7223aae', '0x506F1c53Ef26D98243777089816A512Ff4Ce66DA'], ['0x39bfae0c96bdc69dc657e381c272997f66cbf9c1']),
    staking: stakings(['0x8459d87618e45dc801bc384ea60596ddb7223aae', '0x506F1c53Ef26D98243777089816A512Ff4Ce66DA'], '0x5416ab2b4b5a40f740b67a83dc5939591b5c08be'),
  },
};
