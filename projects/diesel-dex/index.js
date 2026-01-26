const { sumTokens } = require("../helper/chain/fuel")
// const { configPost } = require('../helper/cache')

async function tvl(api) {
  const contractId = '0x7c293b054938bedca41354203be4c08aec2c3466412cac803f4ad62abf22e476'
  // const { pools } = await configPost('mira-ly', 'https://prod.api.mira.ly/pools', { "volume_hours": 24, "apr_days": 1 })
  // const tokens = pools.map(i => i.id.split('_').slice(0, 2)).flat()
  // const provider = await fuels.Provider.create('https://mainnet.fuel.network/v1/graphql')
  // const contract = new fuels.Contract(contractId, abi, provider)
  // const { value } = await contract.functions.total_assets().get()
  return sumTokens({ api, owner: contractId,  })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}

// https://github.com/mira-amm/mira-v1-ts/blob/main/sway_abis/contracts/mira_amm_contract/release/mira_amm_contract-abi.json
