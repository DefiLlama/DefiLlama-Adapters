const { queryContract } = require('../helper/chain/cosmos')

const config = {
  neutron: [{
    coinGeckoId: "cosmos",
    dropContract: "neutron15v5acjfttf3umzatmj7rqfjy6yzcgekh266ehjsxclvaem0hpd7q9qpscr"
  },
  {
    coinGeckoId: "celestia",
    dropContract: "neutron1vqtnu54addf87qp73fnjvqafruzkr2zjgswkhsmsg45t08wla2nqqan0hc"
  }],
};

async function tvl(api) {
  for (const { coinGeckoId, dropContract, decimals = 6 } of config[api.chain]) {
    const delegations = await queryContract({ contract: dropContract, chain: api.chain, data: {
        "extension": {
          "msg": {
            "delegations": {}
          }
        }
      }
    });
    const bonded = delegations.delegations.delegations.map(delegation => Number(delegation.amount.amount)).reduce((ps, amount) => ps + amount, 0);
    api.addCGToken(coinGeckoId, bonded / 10 ** decimals)
  }
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on DROP",
  neutron: { tvl }
}