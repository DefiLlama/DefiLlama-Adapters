const sdk = require('@defillama/sdk');
const axios = require('axios')
const {staking} = require('../helper/staking')
//Arbitrum
const arbitrumApiEndpoint = 'https://gmx-server-mainnet.uw.r.appspot.com/tokens'
const arbitrumVault = '0x489ee077994B6658eAfA855C308275EAd8097C4A';
const arbitrumStaking = '0x908C4D94D34924765f1eDc22A1DD098397c59dD4';
const arbitrumGMX = '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a';
//Avalanche
const avalancheApiEndpoint = 'https://gmx-avax-server.uc.r.appspot.com/tokens'
const avalancheVault = '0x9ab2De34A33fB459b538c43f251eB825645e8595'
const avalancheStaking = '0x2bD10f8E93B3669b6d42E74eEedC65dd1B0a1342'
const avalancheGMX = '0x62edc0692BD897D2295872a9FFCac5425011c661'

const arbitrumTVL = async (timestamp, block, chainBlocks) =>{
  const balances = {}
  const allTokens = (await axios.get(arbitrumApiEndpoint)).data
  const tokenBalances = await sdk.api.abi.multiCall({
      calls: allTokens.map(token=>({
          target: token.id,
          params: [arbitrumVault]
      })),
      abi: 'erc20:balanceOf',
      chain: 'arbitrum',
      block: chainBlocks.arbitrum
  })
  sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, d=>`arbitrum:${d}`)
  return balances
}

const avalancheTVL = async (timestamp, block, chainBlocks) =>{
  const balances = {}
  const allTokens = (await axios.get(avalancheApiEndpoint)).data
  const tokenBalances = await sdk.api.abi.multiCall({
      calls: allTokens.map(token=>({
          target: token.id,
          params: [avalancheVault]
      })),
      abi: 'erc20:balanceOf',
      chain: 'avax',
      block: chainBlocks.avax
  })
  sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, d=>`avax:${d}`)
  return balances
}

module.exports = {
  arbitrum: {
    staking: staking(arbitrumStaking, arbitrumGMX, "arbitrum", "gmx", 18),
    tvl: arbitrumTVL
  },
  avalanche: {
    staking: staking(avalancheStaking, avalancheGMX, "avax", "gmx", 18),
    tvl: avalancheTVL
  }
};
