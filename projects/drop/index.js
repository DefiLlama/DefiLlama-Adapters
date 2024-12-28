const { queryContract } = require('../helper/chain/cosmos')

const config = {
  neutron: [{
    coinGeckoId: "cosmos",
    contract: "neutron16m3hjh7l04kap086jgwthduma0r5l0wh8kc6kaqk92ge9n5aqvys9q6lxr"
  }],
};

async function tvl(api) {
  for (const { coinGeckoId, contract, decimals = 6 } of config[api.chain]) {
    const bonded = await queryContract({ contract, chain: api.chain, data: { "total_bonded": {} } })
    api.addCGToken(coinGeckoId, bonded / 10 ** decimals)
  }
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on DROP",
  neutron: { tvl }
}