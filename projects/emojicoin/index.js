const { function_view, timestampToVersion } = require("../helper/chain/aptos");

async function getAllMarkets(ledgerVersion) {
  // This function will get all markets and the associated TVL in APT
  const registry = await function_view({
    functionStr: "0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe::emojicoin_dot_fun::registry_view",
    args: [],
    type_arguments: [],
    ledgerVersion,
  })
  return registry.total_quote_locked.value
}

async function tvl(api) {
  // const version = await timestampToVersion(api.timestamp, 1962588495); // this query is not working
  const tvl_amount = await getAllMarkets();
  api.add("0x1::aptos_coin::AptosCoin", tvl_amount);
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Emojicoin.fun",
  aptos: {
    tvl,
  },
};