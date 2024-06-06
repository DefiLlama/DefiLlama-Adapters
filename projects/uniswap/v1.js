const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const { getLogs } = require('../helper/cache/getLogs')

const START_BLOCK = 6627917;
const FACTORY = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95';
const ETH = ADDRESSES.null.toLowerCase();

async function tvl(api) {
  const block = api.block
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

  const tokenBalances = (
    await sdk.api.abi
      .multiCall({
        abi: 'erc20:balanceOf',
        calls: Object.keys(exchanges).map((exchangeAddress) => ({
          target: exchanges[exchangeAddress],
          params: exchangeAddress,
        })),
        block,
      })
  ).output;

  // note that this undercounts ETH locked
  // it only measures ETH in exchanges for supported tokens
  const ETHBalances = (
    await sdk.api.eth
      .getBalances({
        targets: Object.keys(exchanges).map((exchangeAddress) => exchangeAddress),
        block,
      })
  ).output;

  return tokenBalances.reduce(
    (accumulator, tokenBalance) => {
      if(tokenBalance.output === null){
        return accumulator
      }
        const balanceBigNumber = new BigNumber(tokenBalance.output)
        if (!balanceBigNumber.isZero()) {
          const tokenAddress = tokenBalance.input.target.toLowerCase()
          accumulator[tokenAddress] = balanceBigNumber.toFixed()
        }
      return accumulator
    },
    {
      [ETH]: ETHBalances.reduce(
        (accumulator, ETHBalance) =>
          accumulator.plus(new BigNumber(ETHBalance.balance)),
        new BigNumber('0')
      ).toFixed(),
    }
  )
}

module.exports={
  tvl
}