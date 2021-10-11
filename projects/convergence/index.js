const {calculateUniTvl} = require('../helper/calculateUniTvl')

async function tvl(timestamp, block) {
  return calculateUniTvl(id=>id, block, 'ethereum', '0x4eef5746ED22A2fD368629C1852365bf5dcb79f1', 12449394, false)
}

module.exports = {
  start: 1621220505, //2021-05-17 00:00:00 +UTC
  tvl,
};
