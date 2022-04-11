const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js');

const START_BLOCK = 3285065 - 1;
const FACTORY = '0x90D882B2789523403ff263D1F93Ead986c38446C';
const MATIC = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'.toLowerCase();

async function tvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'polygon'
  const block = chainBlocks[chain]
  const logs = (await sdk.api.util
    .getLogs({
      keys: [],
      toBlock: block,
      chain,
      target: FACTORY,
      fromBlock: START_BLOCK,
      topic: 'NewExchange(address,address)',
    })).output;

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
        block,
        chain,
      })
  ).output;

  /*
  const tokenBalances = (
    await sdk.api.abi
      .multiCall({
        abi: 'erc20:balanceOf',
        calls: Object.keys(exchanges).map((exchangeAddress) => ({
          target: exchanges[exchangeAddress],
          params: exchangeAddress,
        })),
        chain,
        block,
      })
  ).output;

  const balances = tokenBalances.reduce(
    (accumulator, tokenBalance) => {
        const balanceBigNumber = new BigNumber(tokenBalance.output)
        if (!balanceBigNumber.isZero()) {
          const tokenAddress = tokenBalance.input.target.toLowerCase()
          accumulator['polygon:'+tokenAddress] = balanceBigNumber.toFixed()
        }
      return accumulator
    },
    {}
  )
  */

  return {
    [MATIC]: ETHBalances.reduce(
      (accumulator, ETHBalance) =>
        accumulator.plus(new BigNumber(ETHBalance.balance)),
      new BigNumber('0')
    ).times(2).toFixed(0),
  }
};

module.exports = {
  misrepresentedTokens: true,
  tvl
}