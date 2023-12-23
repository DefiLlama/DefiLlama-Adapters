const { queryContract } = require("../helper/chain/cosmos");
const ADDRESSES = require('../helper/coreAssets.json')

const consts = {
  MILKYWAY_CONTRACT: 'osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0',
}

async function tvl() {
  const { api } = arguments[3]
  const data = await queryContract({ contract: consts.MILKYWAY_CONTRACT, chain: api.chain, data: { state: {} } });
  api.add('ibc/'+ADDRESSES.ibc.TIA, data.total_native_token)
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts the tokens that are locked in the Milky Way contract',
  osmosis: {
    tvl,
  }
}