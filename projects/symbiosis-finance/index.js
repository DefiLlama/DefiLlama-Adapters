const sdk = require('@defillama/sdk');
const {
  transformBscAddress,
  transformAvaxAddress,
  transformPolygonAddress,
  transformBobaAddress
} = require('../helper/portedTokens');

const getTokenAbi = require("./abi/getToken.json");
const getTokenBalanceAbi = require("./abi/getTokenBalance.json");
const BigNumber = require("bignumber.js");

const config = {
  chains: [
    {
      id: 1,
      name: 'ethereum',
      portal: '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84',
      stable: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      pools: []
    },
    {
      id: 56,
      name: 'bsc',
      portal: '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147',
      stable: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
      pools: [
        '0xab0738320A21741f12797Ee921461C691673E276', // BUSD + sUSDC from Ethereum
      ]
    },
    {
      id: 43114,
      name: 'avax',
      portal: '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147',
      stable: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
      pools: [
        '0xab0738320A21741f12797Ee921461C691673E276', // USDC.e + sUSDC from Ethereum
        '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db', // USDC.e + sBUSD from BSC
      ]
    },
    {
      id: 137,
      name: 'polygon',
      portal: '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147',
      stable: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
      pools: [
        '0xab0738320A21741f12797Ee921461C691673E276', // USDC + sUSDC from Ethereum,
        '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db', // USDC + sBUSD from BSC,
        '0x3F1bfa6FA3B6D03202538Bf0cdE92BbE551104ac', // USDC + sUSDC.e from Avalanche
      ]
    },
    {
      id: 288,
      name: 'boba',
      portal: '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147',
      stable: '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc', // USDC
      pools: [
        '0xab0738320A21741f12797Ee921461C691673E276', // USDC + sUSDC from Ethereum,
        '0xe0ddd7afC724BD4B320472B5C954c0abF8192344', // USDC + sBUSD from BSC,
      ]
    },
  ]
}

async function getTransform(chainName) {
  let transform = (address) => {
    return address
  }
  if (chainName === 'bsc') {
    transform = await transformBscAddress();
  } else if (chainName === 'avax') {
    transform = await transformAvaxAddress();
  } else if (chainName === 'polygon') {
    transform = await transformPolygonAddress();
  } else if (chainName === 'boba') {
    transform = await transformBobaAddress();
  }
  return transform
}

async function tvl(chainName, timestamp, block, chainBlocks) {
  const transform = await getTransform(chainName)

  const chain = config.chains.find((chain) => chain.name === chainName)
  if (!chain) throw new Error('Chain config not found')

  let chainBlock = chainBlocks[chainName]
  if (!chainBlock) {
    const block = await sdk.api.util.getLatestBlock(chainName)
    chainBlock = block.number
    if (!chainBlock) {
      throw new Error('Cannot get block by chainName')
    }
  }

  const params = {
    abi: 'erc20:balanceOf',
    chain: chain.name,
    target: chain.stable,
    params: [chain.portal],
    block: chainBlock,
  }

  const collateralBalance = (await sdk.api.abi.call(params)).output;

  const portalBalances = {};
  sdk.util.sumSingleBalance(portalBalances, chain.stable, collateralBalance)

  const poolIndexes = [0, 1] // every stable pool consists of 2 assets
  const poolBalancePromises = chain.pools.map(async (pool) => {
    const tokens = (await sdk.api.abi.multiCall({
      calls: poolIndexes.map((index) => ({
        target: pool,
        params: [index],
      })),
      abi: getTokenAbi,
      chain: chain.name,
      block: chainBlock,
    })).output.map((i) => i.output);

    const tokenBalances = (await sdk.api.abi.multiCall({
      calls: poolIndexes.map((index) => ({
        target: pool,
        params: [index],
      })),
      abi: getTokenBalanceAbi,
      chain: chain.name,
      block: chainBlock,
    })).output.map((i) => i.output);

    return poolIndexes.map((index) => {
      return {
        address: tokens[index],
        balance: tokenBalances[index],
      }
    })
  })

  const poolBalances = await Promise.all(poolBalancePromises)
  const allBalances = poolBalances
    .reduce((acc, items) => {
      items.forEach((item) => {
        sdk.util.sumSingleBalance(acc, item.address, item.balance)
      })
      return acc
    }, portalBalances)

  return Object.keys(allBalances).reduce((acc, address) => {
    acc[transform(address)] = allBalances[address]
    return acc
  }, {})
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'Counts the amount of locked assets in Portal contracts plus amount locked in stable pools',
  ethereum: {
    tvl: (...params) => {
      return tvl('ethereum', ...params)
    },
  },
  bsc: {
    tvl: (...params) => {
      return tvl('bsc', ...params)
    },
  },
  avax: {
    tvl: (...params) => {
      return tvl('avax', ...params)
    },
  },
  polygon: {
    tvl: (...params) => {
      return tvl('polygon', ...params)
    },
  },
  boba: {
    tvl: (...params) => {
      return tvl('boba', ...params)
    },
  },
};