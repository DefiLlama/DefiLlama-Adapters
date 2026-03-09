const { function_view } = require("../helper/chain/aptos");

async function _getDaoBalance() {
    const balances = await function_view({
        functionStr: "0x50a340a19e6ada1be07192c042786ca6a9651d5c845acc8727e8c6416a56a32c::dao::balances",
        args: [],
        type_arguments: [],
    })

    return balances.data
}

module.exports = {
    timetravel: false,
    methodology: "Counts the total liquidity in all pools on Auro Finance.",
    aptos: {
      tvl: async (api) => {
        let balances = await _getDaoBalance();

        for (const coin of balances) {
          api.add(coin.key, Number(coin.value));
        }
        api.removeTokenBalance('0x534e4c3dc0f038dab1a8259e89301c4da58779a5d482fb354a41c08147e6b9ec')  // USDA, projects own token
      },
    },
  };