const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { staking } = require('../helper/staking')

const stkTRU = '0x23696914Ca9737466D8553a2d619948f548Ee424'
const TRU = '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784'
const managedPortfolioFactory = '0x17b7b75FD4288197cFd99D20e13B0dD9da1FF3E7'

const pools = [
  '0x97cE06c3e3D027715b2d6C22e67D5096000072E5', // TUSD
  '0x6002b1dcB26E7B1AA797A17551C6F487923299d7', // USDT
  '0xA991356d261fbaF194463aF6DF8f0464F8f1c742', // USDC
  '0x1Ed460D149D48FA7d91703bf4890F97220C09437', // BUSD
]

let tvlPromise  = {}
async function getAllTvl(block) {
  if (!tvlPromise[block]) tvlPromise[block] = _getAll(block)
  return tvlPromise[block]

  async function _getAll(block) {

    const tokens = (await sdk.api.abi.multiCall({
      calls: pools.map(target => ({ target })),
      abi: abi.token,
      block
    })).output
  
    const currencyBalance = (await sdk.api.abi.multiCall({
      calls: pools.map(target => ({ target })),
      abi: abi.currencyBalance,
      block
    })).output

    const loansValue = (await sdk.api.abi.multiCall({
      calls: pools.map(target => ({ target })),
      abi: abi.loansValue,
      block
    })).output
  
    const portfolios = (await sdk.api.abi.call({
      target: managedPortfolioFactory,
      abi: abi.getPortfolios,
      block
    })).output
    const pCalls = portfolios.map(i => ({ target: i}))
  
    const underlyingToken = (await sdk.api.abi.multiCall({
      calls: pCalls,
      abi: abi.underlyingToken,
      block
    })).output
    
    const liquidValue = (await sdk.api.abi.multiCall({
      calls: pCalls,
      abi: abi.liquidValue,
      block
    })).output
  
    const illiquidValue = (await sdk.api.abi.multiCall({
      calls: pCalls,
      abi: abi.illiquidValue,
      block
    })).output
  
    const balances = {
      tvl: {},
      borrowed: {},
    }
  
    tokens.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances.tvl, output, currencyBalance[i].output))
    tokens.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances.borrowed, output, loansValue[i].output))
    underlyingToken.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances.tvl, output, liquidValue[i].output))
    underlyingToken.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances.borrowed, output, illiquidValue[i].output))
    return balances

  }
} 

async function borrowed(ts, block) {
  return (await getAllTvl(block)).borrowed
}

async function tvl(ts, block) {
  return (await getAllTvl(block)).tvl
}

module.exports = {
  start: 1605830400,            // 11/20/2020 @ 12:00am (UTC)
  ethereum: {
    tvl,
    staking: staking(stkTRU, TRU, 'ethereum'),
    borrowed,
  }
}