const sdk = require('@defillama/sdk');
const _ = require('underscore');
const axios = require('axios')

async function balancesInAddress(address, chain, chainId, block) {
  const allTokens = (await axios.get(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items

  const balanceOfOmniBridge = block > 10590093
    ? await sdk.api.abi.multiCall({
      block,
      calls: _.map(allTokens, (token) => ({
        target: token.contract_address,
        params: omniBridge
      })),
      chain,
      abi: 'erc20:balanceOf'
    })
    : { output: [] };
  const balances = {}
  sdk.util.sumMultiBalanceOf(balances, balanceOfOmniBridge)
  return balances
}

const tokenAddresses = [
  '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', // SAI
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  '0x06af07097c9eeb7fd685c692751d5C66db49c215'  // CHAI
];
const omniBridge = '0x88ad09518695c6c3712AC10a214bE5109a655671';
const xDaiBridge = '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016';
const owlToken = '0x1a5f9352af8af974bfc03399e3767df6370d82e4';
const owlBridge = '0xed7e6720ac8525ac1aeee710f08789d02cd87ecb'
async function eth(timestamp, block) {
  let balances = {};

  if (block > 10590093) {
    balances = await balancesInAddress(omniBridge, 'ethereum', 1, block)
  }
  const balanceOfXdaiBridge = await sdk.api.abi.multiCall({
    block,
    calls: _.map(tokenAddresses, (token) => ({
      target: token,
      params: xDaiBridge
    })),
    abi: 'erc20:balanceOf'
  });

  sdk.util.sumMultiBalanceOf(balances, balanceOfXdaiBridge)

  try{
    const owlOnAmb = await sdk.api.erc20.balanceOf({
      target: owlToken,
      owner: owlBridge,
      block
    })
    sdk.util.sumSingleBalance(balances, owlToken, owlOnAmb.output)
  } catch(e){}

  return balances;
}

const bscOmniBridge = '0xF0b456250DC9990662a6F25808cC74A6d1131Ea9'
async function bsc(timestamp, ethBlock, chainBlocks) {
  return balancesInAddress(bscOmniBridge, 'bsc', 56, chainBlocks['bsc'])
}

module.exports = {
  ethereum: {
    tvl: eth
  },
  bsc: {
    tvl: bsc
  },
  start: 1539028166,
  tvl: sdk.util.sumChainTvls([eth, bsc])
};
