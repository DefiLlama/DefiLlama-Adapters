const { calculateUniTvl} = require('../helper/calculateUniTvl.js')
const { transformPolygonAddress, 
  transformOkexAddress } = require('../helper/portedTokens.js');
const { getBlock } = require('../helper/getBlock')

async function polygon(timestamp, block, chainBlocks) {
  return await tvl(
    chainBlocks['polygon'], 
    '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B', 
    'polygon', 
    5436830, 
    await transformPolygonAddress()
  );
};

async function okex(timestamp, block, chainBlocks) {
  let a = await getBlock(timestamp, 'okexchain', chainBlocks)
  return await tvl(
    await getBlock(timestamp, 'okexchain', chainBlocks), 
    '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B', 
    'okexchain', 
    5436830, 
    await transformOkexAddress()
  );
};

async function tvl(block, factory, chain, startBlock, transform=a=>a) {
  return await calculateUniTvl(transform, block, chain, factory, startBlock, true);
};

module.exports = {
  polygon:{
    tvl: polygon,
  },
  okex:{
    tvl: okex,
  },
}