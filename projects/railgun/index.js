const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const CONTRACTS = {
  ethereum: {
    STAKING: '0xee6a649aa3766bd117e12c161726b693a1b2ee20',
    RAIL: '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D',
    PROXY: '0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9',
  },

  bsc: {
    STAKING: '0x753f0F9BA003DDA95eb9284533Cf5B0F19e441dc',
    RAIL: '0x3F847b01d4d498a293e3197B186356039eCd737F',
    PROXY: '0x590162bf4b50F6576a459B75309eE21D92178A10',
  },

  polygon: {
    STAKING: '0x9AC2bA4bf7FaCB0bbB33447e5fF8f8D63B71dDC1',
    RAIL: '0x92A9C92C215092720C731c96D4Ff508c831a714f',
    PROXY: '0x19B620929f97b7b990801496c3b361CA5dEf8C71',
  },
  
  arbitrum: {
    PROXY: '0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9',
  },
};
const blacklistedTokens = [
  '0x2e14949ce0133ccfd4c0cbe707ba878015a7a40c',
]

function getTVLFunc(contractAddress, chain) {
  return async function (api) {
    if (CONTRACTS[chain].RAIL) blacklistedTokens.push(CONTRACTS[chain].RAIL)
    return sumTokens2({ owner: contractAddress, fetchCoValentTokens: true, blacklistedTokens, api })
  }
}

function getChainTVL(chain) {
  return {
    staking: CONTRACTS[chain].STAKING ? staking(CONTRACTS[chain].STAKING, CONTRACTS[chain].RAIL) : undefined,
    tvl: getTVLFunc(CONTRACTS[chain].PROXY, chain),
  };
}

Object.keys(CONTRACTS).forEach(chain => {
  module.exports[chain] = getChainTVL(chain)
}) 
