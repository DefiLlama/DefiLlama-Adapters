const sdk = require('@defillama/sdk');
const {
  getChainTransform,
} = require('../helper/portedTokens');

const getTokenAbi = require("./abi/getToken.json");
const getTokenBalanceAbi = require("./abi/getTokenBalance.json");

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
    {
      id: 1313161554,
      name: 'aurora',
      portal: '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F',
      stable: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', // USDC
      pools: [
        '0x7Ff7AdE2A214F9A4634bBAA4E870A5125dA521B8', // USDC + sBUSD from BSC,
        '0x7F1245B61Ba0b7D4C41f28cAc9F8637fc6Bec9E4', // USDC + sUSDC from Polygon,
      ]
    },
    {
      id: 40,
      name: 'telos',
      portal: '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F',
      stable: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b', // USDC
      pools: [
        '0x7f3C1E54b8b8C7c08b02f0da820717fb641F26C8', // USDC + sBUSD from BSC,
      ]
    },
  ]
}

async function getTransform(chainName) {
  return getChainTransform(chainName)
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
  aurora: {
    tvl: (...params) => {
      return tvl('aurora', ...params)
    },
  },
  telos: {
    tvl: (...params) => {
      return tvl('telos', ...params)
    },
  },
};