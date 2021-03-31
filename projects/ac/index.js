const sdk = require('@defillama/sdk');
const vaultAbi = require('./abis/vault');
const singlePlusAbi = require('./abis/singlePlus');
const _ = require('underscore');
const BigNumber = require('bignumber.js');

const iVaultAddresses = [
  '0x1eB47C01cfAb26D2346B449975b7BF20a34e0d45', //acBTC
  //'0xF2c6706af78d15549c9376d04E40957A3B357de4', //UNI-ETH-AC
]

const bscSingleTokens = [
  '0xcf8D1D3Fce7C2138F85889068e50F0e7a18b5321', //vBTC+
  '0x73FddFb941c11d16C827169Bb94aCC227841C396', //fBTCB+
  '0xD7806143A4206aa9A816b964e4c994F533b830b0', //acsBTCB+
  '0x02827D495B2bBe37e1C021eB91BCdCc92cD3b604', //autoBTC+
]

async function tvl(timestamp, block) {
  const balances = {};
  const iVaultToUnderlyingToken = {};
  const singleToUnderlyingToken = {};

  const underlyingIVaultAddressResults = await sdk.api.abi.multiCall({
    calls: _.map(iVaultAddresses, (address) => ({
      target: address
    })),
    abi: vaultAbi["token"],
    block,
  });

  _.each(underlyingIVaultAddressResults.output, (token) => {
    if(token.success) {
      const underlyingTokenAddress = token.output;
      const iVaultAddress = token.input.target;
      iVaultToUnderlyingToken[iVaultAddress] = underlyingTokenAddress;
      if (!balances.hasOwnProperty(underlyingTokenAddress)) {
        balances[underlyingTokenAddress] = 0;
      }
    }
  });

  const iVaultBalanceResults = await sdk.api.abi.multiCall({
    block,
    calls: _.map(iVaultAddresses, (address) => ({
      target: address
    })),
    abi: vaultAbi["balance"]
  });

  _.each(iVaultBalanceResults.output, (tokenBalanceResult) => {
    if(tokenBalanceResult.success) {
      const valueInToken = tokenBalanceResult.output;
      const iVaultAddress = tokenBalanceResult.input.target;
      balances[iVaultToUnderlyingToken[iVaultAddress]] = BigNumber(balances[iVaultToUnderlyingToken[iVaultAddress]]).plus(valueInToken).toFixed(0);
    }
  });

  const bscBlock = await sdk.api.util.lookupBlock(timestamp, {
    chain:'bsc'
  })

  const underlyingSingleTokenAddressResults = await sdk.api.abi.multiCall({
    calls: _.map(bscSingleTokens, (address) => ({
      target: address
    })),
    block: bscBlock.block,
    abi: singlePlusAbi["token"],
    chain: 'bsc'
  });

  _.each(underlyingSingleTokenAddressResults.output, (token) => {
    if(token.success) {
      const underlyingTokenAddress = "bsc:" + token.output;
      const singleTokenAddress = token.input.target;
      singleToUnderlyingToken[singleTokenAddress] = underlyingTokenAddress;
      if (!balances.hasOwnProperty(underlyingTokenAddress)) {
        balances[underlyingTokenAddress] = 0;
      }
    }
  });

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
      balances[singleToUnderlyingToken[singleTokenAddress]] = BigNumber(balances[singleToUnderlyingToken[singleTokenAddress]]).plus(valueInToken).toFixed(0);
    }
  });

  return balances;
}

module.exports = {
  name: 'acoconut.fi',
  token: 'AC',
  category: 'assets',
  start: 1600185600,    // 09/16/2020 @ 12:00am (UTC+8)
  tvl,
};
