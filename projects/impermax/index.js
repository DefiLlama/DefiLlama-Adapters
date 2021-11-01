const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const {getBlock} = require('../helper/getBlock')
const {transformArbitrumAddress} = require('../helper/portedTokens')
const {polygon} = require('./subgraph')

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
    getAddress: addr => `arbitrum:${addr}`
  },
  avax: {
    chain: 'avax',
    factory: '0x8c3736e2fe63cc2cd89ee228d9dbcab6ce5b767b',
    startBlock: 5928819,
    getAddress: addr => `avax:${addr}`
  }
};

function getTvlCalculator(chainData) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let {chain, factory, startBlock, getAddress} = chainData;
    const block = await getBlock(timestamp, chain, chainBlocks);
    if(chain === "arbitrum"){
      getAddress = await transformArbitrumAddress()
    }

    const xUniswapV2= await xUniswapV2TVL(block, chain, factory, startBlock);

    const tokenAddresses = new Set(Object.keys(xUniswapV2));

    const balances = Array
      .from(tokenAddresses)
      .reduce((accumulator, tokenAddress) => {
        const xUniswapV2Balance = new BigNumber(xUniswapV2[tokenAddress] || '0');
        accumulator[getAddress(tokenAddress)] = xUniswapV2Balance.toFixed();

        return accumulator
      }, {});
    return balances
  };
}

const chainTvls = {
  polygon: {
    tvl: polygon.tvl
  },
  arbitrum: {
    tvl: getTvlCalculator(data.arbitrum)
  },
  ethereum: {
    tvl: getTvlCalculator(data.ethereum)
  },
  avax: {
    tvl: getTvlCalculator(data.avax)
  },
};

module.exports = {
  ...chainTvls,
  tvl: sdk.util.sumChainTvls(Object.values(chainTvls).map(tvl=>tvl.tvl))
};
