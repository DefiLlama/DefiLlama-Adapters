/*==================================================
  Modules
  ==================================================*/

const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require('bignumber.js');

/*==================================================
  TVL
  ==================================================*/

// ask comptroller for all markets array
async function getAllCTokens(block) {
  return (await sdk.api.abi.call({
    block,
    target: '0x0C8c1ab017c3C0c8A48dD9F1DB2F59022D190f0b',
    params: [],
    abi: abi['getAllMarkets'],
  })).output;
}

async function getUnderlying(block, cToken) {
  if (cToken === '0x27A94869341838D5783368a8503FdA5fbCd7987c') {
    return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';//cETH => WETH
  }

  return (await sdk.api.abi.call({
    block,
    target: cToken,
    abi: abi['underlying'],
  })).output;
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(block) {
  let markets = {};

  let allCTokens = await getAllCTokens(block);
    // if not in cache, get from the blockchain
    await (
      Promise.all(allCTokens.map(async (cToken) => {
        let underlying = await getUnderlying(block, cToken);

        if (!markets[underlying]) {
          let info = await sdk.api.erc20.info(underlying);
          markets[underlying] = { cToken, decimals: info.output.decimals, symbol: info.output.symbol };
        }
      }))
    );

    return markets;
}

async function tvl(timestamp, block) {
  let balances = {};
  let markets = await getMarkets(block);

  // Get V2 tokens locked
  let v2Locked = await sdk.api.abi.multiCall({
    block,
    calls: _.map(markets, (data, underlying) => ({
      target: data.cToken,
    })),
    abi: abi['getCash'],
  });

  _.each(markets, (data, underlying) => {
    let getCash = _.find(v2Locked.output, (result) => result.success && result.input.target === data.cToken);

    if (getCash) {
      balances[underlying] = BigNumber(balances[underlying] || 0)
        .plus(getCash.output)
        .toFixed();
    }
  });

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: 'WePiggy',
  website: 'https://wepiggy.com',
  token: 'WPC',
  category: 'lending',
  start: 1610953200, // 01/18/2021 @ 03:00pm (UTC)
  tvl,
};
