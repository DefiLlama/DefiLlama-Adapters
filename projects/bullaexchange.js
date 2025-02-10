const { sumTokens2 } = require('../helper/unwrapLPs');

const POOLS = [
0xd667467e27cd3ff1845f08c2d9e638b57ddc75c3,
0x90f79fdec42351e514c35cd93cb5f1b965585132,
0x901c19842e400c6a0c214dc0960f84fcfd4ee3d0,
0xd6481d35c3c370a08fb3d50ac0b0ca5f2b77cf06,
];

async function tvl(api) {
  const balances = {};
  for (const pool of POOLS) {
    const tokens = await api.call({
      abi: 'erc20:tokens',
      target: pool,
    });
    for (const token of tokens) {
      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: token,
        params: [pool],
      });
      api.add(token, balance);
    }
  }
  return balances;
}

module.exports = {
  methodology: 'Counts the balances of all tokens in Bulla Exchange pools.',
  start: 0, 
  berachain: {
    tvl,
  },
};
