const sdk = require('@defillama/sdk')
const pairContract = require('./abi/pairContract')
const { get } = require('../helper/http');

// getAllPairAddresses-- 0x607b6d16
// After for each of the pairs, we do the following:
// Call totalCollateral-- 0x4ac8eb5f for each
// 

const BLOCK_START = 22034910;

async function tvl(api) {
    const pairs = await get('https://raw.githubusercontent.com/resupplyfi/resupply/main/deployment/contracts.json');

    const crv = [];
    const frx = [];
  
    for (const [key, value] of Object.entries(pairs)) {
      if (!key.endsWith('_DEPRECATED')) {
        if (key.startsWith('PAIR_CURVELEND')) crv.push(value);
        else if (key.startsWith('PAIR_FRAXLEND')) frx.push(value);
      }
    }

    const [crvTVLs, frxTVLs] = await Promise.all([
      api.multiCall({
        abi: pairContract.totalCollateral, // or getPairAccounting
        calls: crv.map(addr => ({ target: addr })),
      }),
      api.multiCall({
        abi: pairContract.totalCollateral,
        calls: frx.map(addr => ({ target: addr })),
      }),
    ]);
  
    const crvTotal = crvTVLs.reduce((sum, bal) => sum + Number(bal) / 1e21, 0);
    const frxTotal = frxTVLs.reduce((sum, bal) => sum + Number(bal) / 1e18, 0);
    
    return {'usd': crvTotal + frxTotal};
  }

module.exports = {
    start: BLOCK_START,
    ethereum: {
    tvl,
  }
}; 