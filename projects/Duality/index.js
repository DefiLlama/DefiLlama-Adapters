const { sumTokens } = require('../helper/chain/cosmos')

const chain = 'neutron'

async function tvl(api) {
  return sumTokens({ 
    chain, 
    owner: 'neutron1n58mly6f7er0zs6swtetqgfqs36jaarqlplf59',
  })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL in Duality module.',
  neutron: {
    tvl
  }
}