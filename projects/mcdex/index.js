/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const axios = require('axios');

/*==================================================
  Helper Functions
  ==================================================*/

async function GenerateCallList() {
  const markets = (await axios.get('https://mcdex.io/api/markets')).data.data.markets;
  const marketStatus = (await axios.get('https://mcdex.io/api/markets/status')).data.data;
  let id2Info = {};
  _.forEach(markets, market => {
    const id = market.id;
    if (market.contractType === 'Perpetual') {
      id2Info[id] = { perpetualAddress: market.perpetualAddress };
    }
  });
  _.forEach(marketStatus, status => {
    if(status===null){
       return;
    }
    const id = status.marketID;
    if (id2Info[id] && status.perpetualStorage && status.perpetualStorage.collateralTokenAddress !== '0x0000000000000000000000000000000000000000') {
      id2Info[id].collateralTokenAddress = status.perpetualStorage.collateralTokenAddress;
    }
  });
  let calls = []
  _.map(id2Info, (info, id) => {
    if (info.collateralTokenAddress && info.perpetualAddress) {
      calls.push({
        target: info.collateralTokenAddress,
        params: info.perpetualAddress
      })
    }
  });
  return calls;
}

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    const ethBalance = (await sdk.api.eth.getBalance({ target: '0x220a9f0DD581cbc58fcFb907De0454cBF3777f76', block })).output;
    let balances = {
      "0x0000000000000000000000000000000000000000": ethBalance,
    };

    const erc20Calls = await GenerateCallList();
    const balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: erc20Calls,
      abi: 'erc20:balanceOf'
    });

    await sdk.util.sumMultiBalanceOf(balances, balanceOfResults);
    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'MCDEX',
    website: 'https://mcdex.io',
    token: 'MCB',
    category: 'derivatives',  // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 1592478252,        // block 10289326 
    tvl,
  };
