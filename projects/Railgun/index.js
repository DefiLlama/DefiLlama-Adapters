const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const tfTUSD = '0xa1e72267084192db7387c8cc1328fade470e4149';
const stkRAIL = '0xee6a649aa3766bd117e12c161726b693a1b2ee20';
const RAIL = '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D';
const TUSD = '0x0000000000085d4780B73119b644AE5ecd22b376';
async function tvl(timestamp, block) {
    let balances = {};
    
     const tftusdTVL = await sdk.api.abi.call({
      target: tfTUSD,
      abi: abi['poolValue'],
      block: block
    });
    const railTVL = await sdk.api.abi.call({
      target: stkRAIL,
      abi: abi['stakeSupply'],
      block: block 
    });
    
    balances[TUSD] = tftusdTVL.output;
    balances[RAIL] = railTVL.output;
    
    return balances;
}
module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}
module.exports = {
  name: 'Railgun',               // project name
  website: 'https://railgun.ch',
  token: 'RAIL',              
  
  tvl                           // tvl adapter
}
