const sdk = require('@defillama/sdk');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')
const BigNumber = require('bignumber.js')

const masterchefIgloos = "0x8AC8ED5839ba269Be2619FfeB3507baB6275C257"
const pool2Token = '0x494Dd9f783dAF777D3fb4303da4de795953592d0'
const iglooTokens = ['0x1bb5541EcCdA68A352649954D4C8eCe6aD68338d', '0x0b9753D73e1c62933e913e9c2C94f2fFa8236F6C', '0x1aCf1583bEBdCA21C8025E172D8E8f2817343d65']
const nest = '0xD79A36056c271B988C5F1953e664E61416A9820F'
const pefiToken = '0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c'
const nestv2 = '0xE9476e16FE488B90ada9Ab5C7c2ADa81014Ba9Ee'

const tokenToCoingeckoId = {
  '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7': 'avalanche-2',
  '0xe896cdeaac9615145c0ca09c8cd5c25bced6384c': 'penguin-finance',
  '0xc38f41a296a4493ff429f1238e030924a1542e50': 'snowball-token',
  '0xf20d962a6c8f70c731bd838a3a388d7d48fa6e15': 'ethereum',
  '0x60781c2586d68229fde47564546784ab3faca982': 'pangolin'
}

async function convertBalancesToCoingecko(balances){
  const newBalances = {}
  await Promise.all(Object.entries(balances).map(async ([token, balance])=>{
    const decimals = await sdk.api.erc20.decimals(token, 'avax')
    newBalances[tokenToCoingeckoId[token.toLowerCase()]] = BigNumber(balance).div(10**Number(decimals.output)).toNumber()
  }))
  return newBalances
}

async function getTokensInMasterChef(chainBlocks){
    const balances = {}
    const tokenBalances = await sdk.api.abi.multiCall({
      calls: iglooTokens.map(token=>({
        target: token,
        params: [masterchefIgloos]
      })),
      abi: 'erc20:balanceOf',
      block: chainBlocks['avax'],
      chain: 'avax'
    })
    await unwrapUniswapLPs(balances, tokenBalances.output.map(output=>({
      token: output.input.target,
      balance: output.output
    })), chainBlocks['avax'], 'avax')
    return await convertBalancesToCoingecko(balances)
}



async function stakingtvl(timestamp, ethereumBlock, chainBlocks) {
  const balances = {}
  const nestBalance = await sdk.api.erc20.balanceOf({
    block: chainBlocks['avax'],
    target: pefiToken,
    owner: nest,
    chain: 'avax'
  })
  sdk.util.sumSingleBalance(balances, pefiToken, nestBalance.output)
  return await convertBalancesToCoingecko(balances)
}

async function stakingtvlv(timestamp, ethereumBlock, chainBlocks) {
  const balances = {}
  const inestBalance = await sdk.api.erc20.balanceOf({
    block: chainBlocks['avax'],
    target: pefiToken,
    owner: nestv2,
    chain: 'avax'
  })
  sdk.util.sumSingleBalance(balances, pefiToken, inestBalance.output)
  return await convertBalancesToCoingecko(balances)
}

module.exports = { 
  staking: {
    tvl:sdk.util.sumChainTvls([stakingtvl,stakingtvlv]),
  },
  tvl: getTokensInMasterChef,
  }
