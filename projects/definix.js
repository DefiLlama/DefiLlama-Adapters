const { get } = require('./helper/http')

async function klaytn() {
  const response = await get(
    "https://database-s3public-g8ignhbbbk6e.s3.ap-southeast-1.amazonaws.com/definix/tvl.json"
  )
  return response.caverTVL;
}
async function bsc() {
  const response = await get(
    "https://database-s3public-g8ignhbbbk6e.s3.ap-southeast-1.amazonaws.com/definix/tvl.json"
  )
  return response.web3TVL;
}
module.exports = {
  klaytn: {
    fetch: klaytn,
  },
  bsc: {
    fetch: bsc,
  },
  fetch: async () => (await bsc()) + (await klaytn()),
};
// node test.js projects/definix.js
