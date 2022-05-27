const { calculateUniTvl} = require('../helper/calculateUniTvl.js')
const { transformPolygonAddress, 
  transformOkexAddress, transformFantomAddress } = require('../helper/portedTokens.js');
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

async function fantom(timestamp, block, chainBlocks) {
  return await tvl(
    chainBlocks['fantom'], 
    '0xd9820a17053d6314B20642E465a84Bf01a3D64f5', 
    'fantom', 
    5436830, 
    await transformFantomAddress()
  );
};

async function tvl(block, factory, chain, startBlock, transform=a=>a) {
  return await calculateUniTvl(transform, block, chain, factory, startBlock, true);
};

module.exports = {
  polygon:{
    tvl: polygon,
  },
  okexchain:{
    tvl: okex,
  },
  fantom:{
    tvl: fantom,
  },
}
