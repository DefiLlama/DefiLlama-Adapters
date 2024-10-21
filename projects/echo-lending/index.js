const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { transformBalances } = require("../helper/portedTokens");
const { function_view } = require("../helper/chain/aptos");

let _data

const mapping = {
  'APT': ADDRESSES.aptos.APT,
}

async function getData() {
  if (!_data)
    _data = _getData()

  return _data


  async function _getData() {
    const resources = await function_view({ functionStr: "0xeab7ea4d635b6b6add79d5045c4a45d8148d88287b1cfa1c3b6a4b56f46839ed::pool_data_provider::get_all_reserves_tokens", })
    const [uTokens, tokens] = await function_view({ functionStr: "0xeab7ea4d635b6b6add79d5045c4a45d8148d88287b1cfa1c3b6a4b56f46839ed::underlying_token_factory::get_coin_asset_pairs", })
    const mapping = {}
    tokens.forEach((token, i) => mapping[token] = uTokens[i])
    
    for (const item of resources) {
      const token = item.token_address
      item.uToken = mapping[token]
      item.reserve = await function_view({ functionStr: "0xeab7ea4d635b6b6add79d5045c4a45d8148d88287b1cfa1c3b6a4b56f46839ed::pool_data_provider::get_reserve_data", args: [token] })
      item.debt = item.reserve[3]
      item.balance = +item.reserve[2] - +item.debt
    }
    return resources.filter(i => i.uToken);
  }
}

module.exports = {
  aptos: {
    tvl: async (api) => {
      const data = await getData()
      api.add(data.map(i => i.uToken), data.map(i => i.balance))
    },
    borrowed: async (api) => {
      const data = await getData()
      api.add(data.map(i => i.uToken), data.map(i => i.debt))
    },
  },
};
