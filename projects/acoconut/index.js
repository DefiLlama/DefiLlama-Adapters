const sdk = require('@defillama/sdk');
const vaultAbi = require('./abis/vault');
const singlePlusAbi = require('./abis/singlePlus');
const _ = require('underscore');
const BigNumber = require('bignumber.js');

const tokensInacBTC = [
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D'
]

const acBTCTokenHolder = '0x73FddFb941c11d16C827169Bb94aCC227841C396'

const bscSingleTokens = [
  '0xcf8D1D3Fce7C2138F85889068e50F0e7a18b5321', //vBTC+
  '0x73FddFb941c11d16C827169Bb94aCC227841C396', //fBTCB+
  '0xD7806143A4206aa9A816b964e4c994F533b830b0', //acsBTCB+
  '0x02827D495B2bBe37e1C021eB91BCdCc92cD3b604', //autoBTC+
]

const btcb = 'bsc:0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'

async function eth(timestamp, block) {
  const balances = {};

  const underlyingacBTC = await sdk.api.abi.multiCall({
    calls: tokensInacBTC.map(token => ({
      target: token,
      params: [acBTCTokenHolder]
    })),
    abi: 'erc20:balanceOf',
    block,
  });
  sdk.util.sumMultiBalanceOf(balances, underlyingacBTC)
  
  return balances;
}

async function bsc(timestamp, block, chainBlocks) {
  const balances = {};

  const bscBlock = chainBlocks.bsc

  balances[btcb] = '0'

  const totalUnderlyingResults = await sdk.api.abi.multiCall({
    block: bscBlock.block,
    calls: _.map(bscSingleTokens, (address) => ({
      target: address
    })),
    abi: singlePlusAbi["totalUnderlying"],
    chain: 'bsc'
  });

  _.each(totalUnderlyingResults.output, (tokenBalanceResult) => {
    if(tokenBalanceResult.success) {
      const valueInToken = tokenBalanceResult.output;
      const singleTokenAddress = tokenBalanceResult.input.target;
      balances[btcb] = BigNumber(balances[btcb]).plus(valueInToken).toFixed(0);
    }
  });

  return balances;
}

module.exports = {
  ethereum:{
    tvl: eth,
  },
  bsc:{
    tvl: bsc
  },
  start: 1600185600,    // 09/16/2020 @ 12:00am (UTC+8)
  tvl: sdk.util.sumChainTvls([eth, bsc])
};
