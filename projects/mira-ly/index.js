const { sumTokens } = require("../helper/chain/fuel")
const { configPost } = require('../helper/cache')

async function tvl(api) {
  const contractId = '0x2e40f2b244b98ed6b8204b3de0156c6961f98525c8162f80162fcf53eebd90e7'
  const { pools } = await configPost('mira-ly', 'https://prod.api.mira.ly/pools', { "volume_hours": 24, "apr_days": 1 })
  const tokens = pools.map(i => i.id.split('_').slice(0, 2)).flat()
  // const provider = await fuels.Provider.create('https://mainnet.fuel.network/v1/graphql')
  // const contract = new fuels.Contract(contractId, abi, provider)
  // const { value } = await contract.functions.total_assets().get()
  // console.log(contract.functions, +value)
  return sumTokens({ api, owner: contractId, tokens })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}

// https://github.com/mira-amm/mira-v1-ts/blob/main/sway_abis/contracts/mira_amm_contract/release/mira_amm_contract-abi.json
