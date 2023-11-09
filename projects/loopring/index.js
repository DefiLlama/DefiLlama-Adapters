const ADDRESSES = require('../helper/coreAssets.json')
 /*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');

  const BigNumber = require('bignumber.js');

 /*==================================================
  Vars
  ==================================================*/

  const oldLoopringExchange = '0x944644Ea989Ec64c2Ab9eF341D383cEf586A5777';
  const newLoopringExchangeDepositContract = '0x674bdf20A0F284D710BC40872100128e2d66Bd3f';

  const listedTokens = [
    '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD',  // LRC
    ADDRESSES.ethereum.USDT,  // USDT
    ADDRESSES.ethereum.DAI,  // DAI
    ADDRESSES.ethereum.LINK,  // LINK
    ADDRESSES.ethereum.USDC,  // USDC
    ADDRESSES.ethereum.WBTC,  // WBTC
    ADDRESSES.ethereum.MKR,  // MKR
  ];

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let ethBalanceOld = await sdk.api.eth.getBalance({target: oldLoopringExchange, block});
    let ethBalanceNew = await sdk.api.eth.getBalance({target: newLoopringExchangeDepositContract, block});
    let ethBlanaceTotal = BigNumber(ethBalanceOld.output || 0).plus(ethBalanceNew.output);

    let balances = {
      [ADDRESSES.null]: ethBlanaceTotal
    };

    let calls = [];
    listedTokens.forEach((token) => {
      calls.push({
        target: token,
        params: oldLoopringExchange
      });
      calls.push({
        target: token,
        params: newLoopringExchangeDepositContract
      });
    });

    let balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls,
      abi: 'erc20:balanceOf'
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true);

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    start: 1574241665, // 11/20/2019 @ 09:21AM (UTC)
    ethereum: { tvl }
  }
