// starbank
const { get } = require('../helper/http')
const {toUSDTBalances} = require("../helper/balances");

const seconds = Math.floor(parseInt(Date.now().toString()) / 1000 / 5); // 5sec cache
const starbankTVLUrl =
    `https://starbank-storage-api.s3.ap-south-1.amazonaws.com/api/consolidatedDataV1.json?timestamp=${seconds}`;

async function tvl() {
  return toUSDTBalances((await get(starbankTVLUrl)).totalLiquidity);
}

module.exports = {
    astar:{
        tvl
    }
};
