const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const {getBlock} = require('../helper/getBlock')

const xUniswapV2TVL = require('./xUniswapV2');

const data = {
  ethereum: {
    chain: 'ethereum',
    factory: '0x8c3736e2fe63cc2cd89ee228d9dbcab6ce5b767b',
    startBlock: 10000835,
    getAddress: addr => addr,
  },
  polygon: {
    chain: 'polygon',
    factory: '0xBB92270716C8c424849F17cCc12F4F24AD4064D6',
    startBlock: 14868433,
    getAddress: addr => `polygon:${addr}`,
  },
  arbitrum: {
    chain: 'arbitrum',
    factory: '0x8c3736e2fe63cc2cd89ee228d9dbcab6ce5b767b',
    startBlock: 763103,
    //getAddress: addr => `arbitrum:${addr}`,
    getAddress: addr => {
      switch (addr) {
        case '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': // weth
          return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
        case '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': // wbtc
          return '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
        case '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': // usdc
          return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
        case '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': // usdt
          return '0xdac17f958d2ee523a2206206994597c13d831ec7';
        case '0xd4d42f0b6def4ce0383636770ef773390d85c61a': // sushi
          return '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2';
        case '0x9c67ee39e3c4954396b9142010653f17257dd39c': // imx
          return '0x7b35ce522cb72e4077baeb96cb923a5529764a00';
      }
      return addr
    },
  }
};

function getTvlCalculator(chainData) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const {chain, factory, startBlock, getAddress} = chainData;
    const block = await getBlock(timestamp, chain, chainBlocks);

    const [xUniswapV2] = await Promise.all([
      xUniswapV2TVL(block, chain, factory, startBlock),
    ]);

    const tokenAddresses = new Set(Object.keys(xUniswapV2));

    return Array
      .from(tokenAddresses)
      .reduce((accumulator, tokenAddress) => {
        const xUniswapV2Balance = new BigNumber(xUniswapV2[tokenAddress] || '0');
        console.log(tokenAddress, getAddress(tokenAddress));
        accumulator[getAddress(tokenAddress)] = xUniswapV2Balance.toFixed();

        return accumulator
      }, {});
  };
}

const chainTvls = {
  ethereum: {
    tvl: getTvlCalculator(data.ethereum)
  },
  polygon: {
    tvl: getTvlCalculator(data.polygon)
  },
  arbitrum: {
    tvl: getTvlCalculator(data.arbitrum)
  },
};

module.exports = {
  ...chainTvls,
  tvl: sdk.util.sumChainTvls(Object.values(chainTvls).map(tvl=>tvl.tvl))
};
