const { queryContract } = require('../helper/chain/cosmos')

const config = {
  neutron: [{
    coinGeckoId: "cosmos",
    dropContract: "neutron16m3hjh7l04kap086jgwthduma0r5l0wh8kc6kaqk92ge9n5aqvys9q6lxr"
  },
  {
    coinGeckoId: "celestia",
    dropContract: "neutron1fp649j8djj676kfvh0qj8nt90ne86a8f033w9q7p9vkcqk9mmeeqxc9955"
  }],
};

async function tvl(api) {
  for (const { coinGeckoId, dropContract, decimals = 6 } of config[api.chain]) {
    const bonded = await queryContract({ contract: dropContract, chain: api.chain, data: { "total_bonded": {} } })
    api.addCGToken(coinGeckoId, bonded / 10 ** decimals)
  }
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on DROP",
  neutron: { tvl }
}