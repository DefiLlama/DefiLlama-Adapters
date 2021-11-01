const {calculateUniTvl} = require('../helper/calculateUniTvl')

async function tvl(timestamp, block) {
  return calculateUniTvl(id=>id, block, 'ethereum', '0x696708db871b77355d6c2be7290b27cf0bb9b24b', 11330678, false)
}

module.exports = {
  start: 1606392528, // 11/26/2020 @ 12:08:48am (UTC)
  tvl,
};
