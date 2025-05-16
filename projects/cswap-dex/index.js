const { sumTokens2 } = require("../helper/chain/cardano");
const { getAdaInAddress } = require("../helper/chain/cardano");
const { getScriptsDatum, getAddressesUTXOs } = require('../helper/chain/cardano/blockfrost')

const MARKETPLACE_POOL_ADDR = "addr1zxjd0cp5dj4u8cyygey8tt7kqrmu90fyca39ds45h4rpygyhsxtnvg5qyn2rl7y6qz6qc6fns87y808anxwzt0pmc8es2g4kc8";
const MARKETPLACE_ORDERBOOK_ADDR = "addr1z9jgk6l4fcus943znsfxj7hrsew5ju8rgru74wlvus400j5hsxtnvg5qyn2rl7y6qz6qc6fns87y808anxwzt0pmc8es5nqza5";

const DEX_POOL_ADDR = "addr1z8ke0c9p89rjfwmuh98jpt8ky74uy5mffjft3zlcld9h7ml3lmln3mwk0y3zsh3gs3dzqlwa9rjzrxawkwm4udw9axhs6fuu6e";
const DEX_ORDERBOOK_ADDR = "addr1z8d9k3aw6w24eyfjacy809h68dv2rwnpw0arrfau98jk6nhv88awp8sgxk65d6kry0mar3rd0dlkfljz7dv64eu39vfs38yd9p";
const STAKING_ADDR = 'addr1zydjdnzpmnv9xzjt4xh9sjfzkk2hcdj4sw39ak58wpvh56cgjrxwszhuqj73gufx56c8qwnuhvf2nw5dzdr5f50rqr5q2m7uqv';

const CONTRACT_ADDRESSES = [ DEX_POOL_ADDR, DEX_ORDERBOOK_ADDR ];
const CSWAP_ASSET_ID = 'c863ceaa796d5429b526c336ab45016abd636859f331758e67204e5c4353574150';

// new TVL using the DEX
async function tvl() {
  const assetsLocked = await sumTokens2({
    owners: CONTRACT_ADDRESSES}
  )

  return assetsLocked
}

async function staking() {
  const assetsStaked = await sumTokens2({
    owner: STAKING_ADDR,
    tokens: [ CSWAP_ASSET_ID ]
  });
  return assetsStaked
}

// old TVL using the NFT AMM Marketplace
async function marketplace() {
  const marketPoolsLocked = await getAdaInAddress(MARKETPLACE_POOL_ADDR)
  const marketOrdersLocked = await getAdaInAddress(MARKETPLACE_ORDERBOOK_ADDR)
  var valueOfAssetsLocked = 0;

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

      valueOfAssetsLocked += (num_assets * buy_price / 1_000_000);
    }
  }

  return marketPoolsLocked + marketOrdersLocked + valueOfAssetsLocked;
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
    staking
  },
}
