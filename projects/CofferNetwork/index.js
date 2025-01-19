const axios = require("axios");

// // resp data structure
// {
//   "code": 200,
//   "data": {
//     "active_satoshi": 0,
//     "pending_satoshi": 0,
//     "unconfirmed_satoshi": 0,
//     "total_satoshi": 100100000,
//     "active_depositors": 0,
//     "total_depositors": 1,
//     "active_protocols": 1,
//     "total_protocols": 1,
//     "btc_price_usd": 104642.6,
//     "network": "testnet",
//     "block_height": 3613745
//   },
//   "msg": ""
// }

async function tvl(api) {
  // const response = await axios.get("http://127.0.0.1:8000/");
  // const response = await axios.get("https://aapi.coffer.network/v1/stats?network=testnet");
  const response = await axios.get("https://aapi.coffer.network/v1/stats");
  const totalBitcoin = response.data.data.total_satoshi / 1e8;

  if (totalBitcoin > 0) {
    api.addCGToken('bitcoin', totalBitcoin)
  } else {
    throw new Error('Coffer: Invalid TVL value');
  }
}

module.exports = {
  methodology: "TVL is fetched from Coffer CoBTC's Staking API and represents the total Bitcoin locked in the Coffer Network BTC staking protocol.",
  start: "2025-01-20",
  timetravel: false,
  bitcoin: {
    tvl,
  },
};