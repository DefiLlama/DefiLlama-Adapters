const { sumTokensExport } = require('../helper/chain/cardano')

module.exports = {
  cardano: {
    tvl: () => 0,
    staking: sumTokensExport({ owner: 'addr1q92f5qddkudgq6sna3qfsqrwnk9253gv4qwmfw735xvluhrsqycc2x23z60333ktgjrrufgv8xh2gnxr4m6av63jkassawurfj'}),
  },
};