const { get } = require('../helper/http')
const { queryContract, totalSupply } = require('../helper/chain/cosmos')

module.exports = {
  timetravel: false,
  juno: {
    tvl: async (api) => {
      let { supply: { bond_denom, total_bonded }} = await queryContract({ chain: api.chain, contract: 'juno1snv8z7j75jwfce4uhkjh5fedpxjnrx9v20ffflzws57atshr79yqnw032r', data: { supply: {}}})
      api.add(bond_denom, total_bonded)
    }
  }
}