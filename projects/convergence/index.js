const {calculateUniTvl} = require('../helper/calculateUniTvl')

const ETH_FACTORY = '0x4eef5746ED22A2fD368629C1852365bf5dcb79f1';
const MOONBEAM_FACTORY = '0x9504d0d43189d208459e15c7f643aac1abe3735d';

async function ethTvl(timestamp, block) {
  return calculateUniTvl(id=>id, block, 'ethereum', ETH_FACTORY, 12449394, false)
}

async function moonbeamTvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(addr=>`moonbeam:${addr}`, chainBlocks['moonbeam'], 'moonbeam', MOONBEAM_FACTORY, 191675, false);
}

module.exports = {
  start: 1621220505, //2021-05-17 00:00:00 +UTC
  ethereum: {
    tvl: ethTvl,
  },
  moonbeam:{
    tvl: moonbeamTvl
  }
};
