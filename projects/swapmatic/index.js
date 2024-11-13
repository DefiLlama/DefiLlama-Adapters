const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js');
const { getLogs } = require('../helper/cache/getLogs')

const START_BLOCK = 3285065 - 1;
const FACTORY = '0x90D882B2789523403ff263D1F93Ead986c38446C';
const MATIC = ADDRESSES.ethereum.MATIC.toLowerCase();

async function tvl(api) {
  const chain = 'polygon'
  const logs = (await getLogs({
      api,
      target: FACTORY,
      fromBlock: START_BLOCK,
      topic: 'NewExchange(address,address)',
    }));

  const exchanges = {};
  logs.forEach((log) => {
    const tokenAddress = `0x${log.topics[1].substring(26)}`.toLowerCase();
    const exchangeAddress = `0x${log.topics[2].substring(26)}`.toLowerCase();
    exchanges[exchangeAddress] = tokenAddress;
  });

  // note that this undercounts ETH locked
  // it only measures ETH in exchanges for supported tokens
  const ETHBalances = (
    await sdk.api.eth
      .getBalances({
        targets: Object.keys(exchanges).map((exchangeAddress) => exchangeAddress),
        block: api.block,
        chain,
      })
  ).output;

  return {
    [MATIC]: ETHBalances.reduce(
      (accumulator, ETHBalance) =>
        accumulator.plus(new BigNumber(ETHBalance.balance)),
      new BigNumber('0')
    ).times(2).toFixed(0),
  }
}

module.exports = {
  misrepresentedTokens: true,
  polygon: { tvl }
}
