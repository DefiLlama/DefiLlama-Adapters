const { function_view, hexToString } = require('../helper/chain/aptos')

async function tvl(_, _b, _cb, { api, }) {
  const [data] = await function_view({ functionStr: '0x1786191d0ce793debfdef9890868abdcdc7053f982ccdd102a72732b3082f31d::basket::get_all_basket_coins_by_basket', type_arguments: ['0x1786191d0ce793debfdef9890868abdcdc7053f982ccdd102a72732b3082f31d::baskets::Basket1'] })
  data.forEach(({ coin_type_info: { account_address, module_name, struct_name }, reserve_amount, margin_occupied_amount, }) => {
    const token = `${account_address}::${hexToString(module_name)}::${hexToString(struct_name)}`
    api.add(token, reserve_amount)
    // api.add(token, margin_occupied_amount * -1)
  })
}


module.exports = {
  aptos: { tvl }
}