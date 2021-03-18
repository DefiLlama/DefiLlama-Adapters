/*==================================================
  Modules
  ==================================================*/

const sdk = require('../../sdk');
const _ = require('underscore');
const axios = require('axios');
const BigNumber = require('bignumber.js');
const ddexMarginContractAddress = '0x241e82c79452f51fbfc89fac6d912e021db1a3b7'

/*==================================================
  Helper Functions
  ==================================================*/

async function GenerateCallList() {
  let assets = await axios.get('https://api.ddex.io/v4/assets');
  assets = assets.data.data.assets;
  assets = _.filter(assets, (asset) => {
    let symbol = asset.symbol;
    return symbol !== "ETH";
  });

  let calls = [];
  _.each(assets, (asset) => {
    calls.push({
      target: asset.address,
      params: ddexMarginContractAddress
    })
  });

  return calls;
}

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  let balances = {
    '0x0000000000000000000000000000000000000000': (await sdk.api.eth.getBalance({target: ddexMarginContractAddress, block})).output
  };

  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: await GenerateCallList(),
    abi: 'erc20:balanceOf'
  });

  await sdk.util.sumMultiBalanceOf(balances, balanceOfResults);

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: 'DDEX',
  category: 'lending',
  start: 1566470505, // 2019-08-22T18:41:45+08:00
  tvl
}
