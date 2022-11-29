const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const farmLPBalance = async (
    chain,
    block,
    masterChef,
    lpToken,
    token0,
    token1,
  ) => {
    const balances = (
      await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: [
          {
            target: token0,
            params: [lpToken],
          },
          {
            target: token1,
            params: [lpToken],
          },
          {
            target: lpToken,
            params: [masterChef],
          },
        ],
        block,
        chain: chain,
      })
    ).output;
      
      const lpTotalSuply = (
      await sdk.api.abi.call({
        target: lpToken,
        abi: 'erc20:totalSupply',
        chain: chain,
        block,
      })
    ).output;
    const token0Locked = new BigNumber(balances[2].output * balances[0].output).div(new BigNumber(lpTotalSuply));
    const token1Locked = new BigNumber(balances[2].output * balances[1].output).div(new BigNumber(lpTotalSuply));
    const result = {};
    result[`${chain}:${token0}`] = token0Locked.toFixed(0);
    result[`${chain}:${token1}`] = token1Locked.toFixed(0);
    return result;
  };

  module.exports = {
    farmLPBalance,
  };