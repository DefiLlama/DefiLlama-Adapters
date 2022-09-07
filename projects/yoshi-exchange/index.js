const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress, transformBscAddress} = require('../helper/portedTokens.js');

const chains = ['fantom', 'bsc'];
const factoryData = {
  fantom: {
    factory: '0xc5bc174cb6382fbab17771d05e6a918441deceea',
    block: 19757372,
    transform: transformFantomAddress
  },
  bsc: {
    factory: '0x542b6524abf0bd47dc191504e38400ec14d0290c',
    block: 13159231,
    transform: transformBscAddress
  }
};

function generateTvlFunction(chain, data) {

  async function tvl(_timestamp, _ethBlock, chainBlocks){
    const transform = await data.transform();

    return calculateUniTvl(transform, chainBlocks[chain], chain, data.factory, data.block, true);
  }
  return tvl;
}

let tvls = {};
Object.entries(factoryData).forEach(([chain, data]) => tvls[chain] = {tvl: generateTvlFunction(chain, data)}); 

module.exports = {
  ...tvls
}
