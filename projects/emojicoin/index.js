const ADDRESSES = require('../helper/coreAssets.json')
const { function_view, timestampToVersion } = require("../helper/chain/aptos");

// This function will get all markets and the associated TVL in APT
async function getAllMarkets(ledgerVersion) {
  // If called with a ledger version too early, an error will be thrown by function_view.
  // If that is the case, return 0 as it means the package wasn't deployed yet and the
  // TVL is then 0.
  const registry = await function_view({
    functionStr: "0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe::emojicoin_dot_fun::registry_view",
    args: [],
    type_arguments: [],
    ledgerVersion,
  })
  return registry.total_quote_locked.value;
}

// Date at which the contract was deployed.
const DEPLOYED_AT_DATE = '2024-11-20';

// Block close to the start date but before it.
const DEPLOYED_AT_BLOCK = 254000000;

async function tvl(api) {
  const version = await timestampToVersion(new Date(api.timestamp * 1000), DEPLOYED_AT_BLOCK);
  const tvl_amount = await getAllMarkets(version);
  api.add(ADDRESSES.aptos.APT, tvl_amount);
}

module.exports = {
  timetravel: true,
  methodology:
    "Aggregates TVL in all pools in Emojicoin.fun",
  aptos: {
    tvl,
  },
  start: DEPLOYED_AT_DATE,
};
