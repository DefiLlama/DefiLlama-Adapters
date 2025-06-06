const { sumTokensExport } = require("../helper/unwrapLPs");

const constant = {
  treasuryPool: {
    address: "0xF4b2aa60Cd469717857a8A4129C3dB9108f54D74",
  }
};

let SURE = '0xcb86c6a22cb56b6cf40cafedb06ba0df188a416e';


module.exports = {
  start: '2017-12-18', // 2020/10/21 6:34:47 (+UTC)
  ethereum: { tvl: sumTokensExport({ owner: constant.treasuryPool.address, token: SURE}) }
};

