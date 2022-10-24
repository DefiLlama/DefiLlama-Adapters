const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')
const erc20Abi = require("../helper/abis/erc20.json")

const getTokenAbi = require("./abi/getToken.json");

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
    {
      id: 2001,
      name: 'milkomeda',
      portal: '0x3Cd5343546837B958a70B82E3F9a0E857d0b5fea',
      pools: [],
      synthStable: '0x42110A5133F91B49E32B671Db86E2C44Edc13832' // sUSDC
    },
  ]
}

module.exports = {
  methodology: 'Counts the amount of locked assets in Portal contracts plus amount locked in stable pools',
};

config.chains.forEach(chainInfo => {
  const { name: chain, stable, portal, pools, } = chainInfo
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const tokensAndOwners = []
      if (stable) tokensAndOwners.push([stable, portal])
      if (pools) {
        const poolIndexes = [0, 1] // every stable pool consists of 2 assets
        const calls = pools.map(i => poolIndexes.map(j => ({ target: i, params: j }))).flat();
        (await sdk.api.abi.multiCall({
          abi: getTokenAbi,
          calls, chain, block,
        })).output.forEach(({ input: { target }, output }) => tokensAndOwners.push([output, target]))
      }
      const tokens = tokensAndOwners.map(i => i[0])
      const { output: nameRes } = await sdk.api.abi.multiCall({
        abi: erc20Abi.name,
        calls: tokens.map(i => ({ target: i })),
        chain, block,
      })
      const blacklistedTokens = tokens.filter((_, i) => nameRes[i].output.startsWith('Synthetic '))
      return sumTokens2({ chain, block, tokensAndOwners, blacklistedTokens, })
    }
  }
})
