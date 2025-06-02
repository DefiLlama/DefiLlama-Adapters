/*==================================================
  Modules
  ==================================================*/

const sdk = require('@defillama/sdk');
const abi = require('./abi');

const BigNumber = require('bignumber.js');

/*==================================================
  Settings
  ==================================================*/

const iVaultAddresses = [
  '0x72Cf258c852Dc485a853370171d46B9D29fD3184', //iUSDT
  '0x3E3db9cc5b540d2794DB3861BE5A4887cF77E48B', //iYCRV
  '0x1e0DC67aEa5aA74718822590294230162B5f2064', //iDAI
  '0x4243f5C8683089b65a9F588B1AE578d5D84bFBC9', //iTUSD
  '0x23B4dB3a435517fd5f2661a9c5a16f78311201c1', //iUSDC
  '0xa8EA49a9e242fFfBdECc4583551c3BcB111456E6', //iETH
  '0xc46d2fC00554f1f874F37e6e3E828A0AdFEFfbcB', //iBUSD
  '0x26AEdD2205FF8a87AEF2eC9691d77Ce3f40CE6E9', //iHBTC
]

const rewardPool = [
  '0x6A77c0c917Da188fBfa9C380f2E60dd223c0c35a', //mefi
  '0x3d367C9529f260B0661e1C1E91167C9319ee96cA', //pool4 iUSDT
]

const yfii = '0xa1d0E215a23d7030842FC67cE582a6aFa3CCaB83'


/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  const balances = {};
  const iVaultToUnderlyingToken = {};



  // Get iVault's underlying tokens
  const underlyingIVaultAddressResults = await sdk.api.abi.multiCall({
    calls: iVaultAddresses.map((address) => ({
      target: address
    })),
    abi: abi["token"]
  });

  underlyingIVaultAddressResults.output.forEach((token) => {
      const underlyingTokenAddress = token.output;
      const iVaultAddress = token.input.target;
      iVaultToUnderlyingToken[iVaultAddress] = underlyingTokenAddress;
      if (!balances.hasOwnProperty(underlyingTokenAddress)) {
        balances[underlyingTokenAddress] = 0;
      }
  });

  // Get iVault's balances in underlying token
  const iVaultBalanceResults = await sdk.api.abi.multiCall({
    block,
    calls: iVaultAddresses.map((address) => ({
      target: address
    })),
    abi: abi["balance"]
  });

  iVaultBalanceResults.output.forEach((tokenBalanceResult) => {
      const valueInToken = tokenBalanceResult.output;
      const iVaultAddress = tokenBalanceResult.input.target;
      balances[iVaultToUnderlyingToken[iVaultAddress]] = BigNumber(balances[iVaultToUnderlyingToken[iVaultAddress]]).plus(valueInToken);
  });


  // Get reward pool 
  const yfiiRewardBalanceResults = await sdk.api.abi.multiCall({
    block,
    calls: rewardPool.map((address) => ({
      target: yfii,
      params: address,
    })),
    abi: 'erc20:balanceOf',
  });
  
  balances[yfii] = new BigNumber(0);
  yfiiRewardBalanceResults.output.forEach((tokenBalanceResult) => {
      const target = tokenBalanceResult.input.target;
      const output = tokenBalanceResult.output;
    
      balances[target] = balances[target].plus(BigNumber(output)); 
  });
  


  


  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  doublecounted: true,
  start: '2020-09-15',    // 09/16/2020 @ 12:00am (UTC+8)
  ethereum: { tvl }
};
