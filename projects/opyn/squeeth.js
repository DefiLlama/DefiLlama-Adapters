const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const START_BLOCK = 13982541;
const controller = "0x64187ae08781B09368e6253F9E94951243A493D5".toLowerCase();
const ETH = '0x0000000000000000000000000000000000000000';
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();

const uniPool = '0x82c427adfdf2d245ec51d8046b41c4ee87f0d29c';

module.exports.tvl = async function tvl(timestamp, block) {  
  let balances = {};

  if(block >= START_BLOCK) {
    // get ETH balance in squeeth vaults
    const balanceVault = (await sdk.api.eth.getBalance({ target: controller, block})).output;
    balances[ETH] = BigNumber(balances[ETH] || 0).plus(BigNumber(balanceVault)).toFixed(0);
    
    // get ETH balance in squeeth pool
    const balancePool = (
      await sdk.api.abi.call({
        target: WETH,
        params: uniPool,
        abi: 'erc20:balanceOf',
        block
      })
    );

    balances[ETH] = BigNumber(balances[ETH] || 0).plus(BigNumber(balancePool.output)).toFixed(0);

  }



  return balances;
}