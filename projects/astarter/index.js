const { getAdaInAddress } = require("../helper/chain/cardano");
const axios = require("axios");

const POOL_ID = "pool1drkls8s0zzjydyv3qpjsdj58w3sw02w9wg0pckrsnuazyef2hca";
// TODO  Waiting for dex to deploy the main network
const DEX_BATHCER_SCRIPT = "addr1wxvf6xqa3jkq9cnyjnf7t4v6aku75rn3l3mlhe9udp4dnwcjscuah";
const DEX_POOL_SCRIPT = "addr1wxe4dwl0jmmchjnd049t5ur7lc4jmhcjax8ht393evxcjsgeccdeu";

async function tvl() {
  const batchOrderLocked = await getAdaInAddress(DEX_BATHCER_SCRIPT);
  const ISPOLocked = await getPoolStake(POOL_ID);


  const adaPrice = await getADAPrice()
  const {list} = await getPairs();

  let poolLockedInUSD = 0;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const {amountInUSD} = item;

    poolLockedInUSD += parseInt(amountInUSD)
  }

  const poolLocked = poolLockedInUSD / adaPrice;

  return {
    cardano: ISPOLocked + poolLocked + batchOrderLocked,
  };
}

async function getPoolStake(poolId) {
  const response = await axios.post('https://api.koios.rest/api/v0/pool_info', {
    "_pool_bech32_ids": [poolId]
  });
  return response.data[0].live_stake / 1e6;
}

// https://cardanoscan.io/tokenHoldings/addr1wxe4dwl0jmmchjnd049t5ur7lc4jmhcjax8ht393evxcjsgeccdeu
async function getPairs() {
  const response = await axios.get('https://api.dex.astarter.io/swap/pools?size=1000&order=amountInUSD&direction=desc');
  return response.data.data;
}

async function getADAPrice() {
  const data = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd',
  );
  price = data.data.cardano.usd;
  return price;
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
