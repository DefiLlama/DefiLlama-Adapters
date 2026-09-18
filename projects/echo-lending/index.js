const { function_view } = require("../helper/chain/aptos");

// wallets deposit so much BTC wrapper but there is no borrow
const blacklistWallets = [
  '0xe7518ae420007626da09e3afff0f9076343267b94797043203e506e3599e965b',
  '0x3b9a45c9d5c73e27c48f85a26a3e9b3fcef44af44ddf9e0995bf17390b1d1bb8',
]

let _data

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
      item.debt = +item.reserve[3]
      item.balance = +item.reserve[2] - +item.debt
      for (const wallet of blacklistWallets) {
        const [aTokenBalance, variableDebt] = await function_view({ functionStr: "0xeab7ea4d635b6b6add79d5045c4a45d8148d88287b1cfa1c3b6a4b56f46839ed::pool_data_provider::get_user_reserve_data", args: [token, wallet] })
        item.balance -= +aTokenBalance - +variableDebt
        item.debt -= +variableDebt
      }
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
