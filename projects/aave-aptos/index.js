const { function_view } = require('../helper/chain/aptos');

async function getData() {
  return function_view({ functionStr: `0x39ddcd9e1a39fa14f25e3f9ec8a86074d05cc0881cbf667df8a6ee70942016fb::ui_pool_data_provider_v3::get_reserves_data`, type_arguments: [], args: [] })
}

async function tvl(api) {
  const [data] = await getData()
  data.forEach(i => {
    api.add(i.underlying_asset, i.available_liquidity)
  })

}

async function borrowed(api) {
  const [data] = await getData()
  data.forEach(i => {
    api.add(i.underlying_asset, i.total_scaled_variable_debt)
  })
}

module.exports = {
  aptos: {
    tvl, borrowed,
  }
};