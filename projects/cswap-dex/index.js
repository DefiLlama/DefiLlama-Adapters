const { getAdaInAddress } = require("../helper/chain/cardano");
const { getScriptsDatum, getAddressesUTXOs } = require('../helper/chain/cardano/blockfrost')

const MARKETPLACE_POOL_ADDR = "addr1zxjd0cp5dj4u8cyygey8tt7kqrmu90fyca39ds45h4rpygyhsxtnvg5qyn2rl7y6qz6qc6fns87y808anxwzt0pmc8es2g4kc8";
const MARKETPLACE_ORDERBOOK_ADDR = "addr1z9jgk6l4fcus943znsfxj7hrsew5ju8rgru74wlvus400j5hsxtnvg5qyn2rl7y6qz6qc6fns87y808anxwzt0pmc8es5nqza5";

async function tvl() {
  const liquidityPoolLocked = await getAdaInAddress(MARKETPLACE_POOL_ADDR)
  const batchOrderLocked = await getAdaInAddress(MARKETPLACE_ORDERBOOK_ADDR)
  var assetLocked = 0;

  // get no. of assets locked in each UTXO * buy price in the datum
  const utxos = await getAddressesUTXOs(MARKETPLACE_POOL_ADDR);
  for (const utxo of utxos) {
    if (utxo.data_hash) {
      // extract policy id and buy price from the datum
      const datum = await getScriptsDatum(utxo.data_hash);

      const policy_id = datum.json_value?.fields[0]?.fields[0]?.fields[2].bytes;
      const buy_price = datum.json_value?.fields[0]?.fields[1]?.fields[7].int;

      // make sure we got the policy id and buy price
      var num_assets = 0;
      if (policy_id && buy_price) {
        for (const amount of utxo.amount) {
          if (amount.unit.startsWith(policy_id)) {
            num_assets++;
          }
        }
      }

      assetLocked += (num_assets * buy_price / 1_000_000);
    }
  }

  return {
    cardano: liquidityPoolLocked + batchOrderLocked + assetLocked,
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
}
