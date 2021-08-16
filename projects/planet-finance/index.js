const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const aquaFarmAddress= '0x0ac58Fd25f334975b1B61732CF79564b6200A933';


async function tvl(timestamp, ethBlock,chainBlocks) {
    let balances = {};

    const poolLength = (await sdk.api.abi.call({
        target: aquaFarmAddress,
        abi: abi['poolLength'],
        chain:'bsc',
      })).output;

    for(var i = 0 ; i < poolLength ; i++){
        const poolInfo = (await sdk.api.abi.call({
            target: aquaFarmAddress,
            abi: abi['poolInfo'],
            chain:'bsc',
            params:i
          })).output;

        const strategyAddress = poolInfo['strat'];
        const wantAddress = poolInfo['want']
        
        const poolTVL = (await sdk.api.abi.call({
            target: strategyAddress,
            abi: abi['wantLockedTotal'],
            chain:'bsc'
          })).output;
          balances[wantAddress] = poolTVL;
    }
    return balances;
}

module.exports = {
  bsc:{
    tvl,
  },
  tvl
}
