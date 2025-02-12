
const { v1Tvl } = require('../helper/balancer')

module.exports = {
  start: '2020-09-30',  // 09/30/2020 @ 4:36am (UTC)
  ethereum: { tvl: v1Tvl('0xebc44681c125d63210a33d30c55fd3d37762675b', 10961776) }
};
