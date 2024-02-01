const sdk = require("@defillama/sdk")
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const { getLPData, getTokenPrices, } = require('../helper/unknownTokens')
const { stakingPricedLP } = require("../helper/staking");
const chain = 'avax'
let totalTvl

const contract = '0x8aC4007633B9CD72B9447BB717e3d2f5682D1760'
const vcs = '0xF6557bC62AC67744961479eA6c131B61444714d6'.toLowerCase()


async function gettotalTvl(block) {
  if (!totalTvl) totalTvl = getTVL()
  return totalTvl

  async function getTVL() {
    const transform = await getChainTransform(chain)
    const balances = {
      tvl: {},
      pool2: {},
      //staking: {},
    }
    const { output: length } = await sdk.api.abi.call({
      target: contract,
      abi: abi.poolLength,
      chain, block,
    })

    const calls = []
    for (let i = 0; i < length; i++) calls.push({ params: [i] })
    const { output: data } = await sdk.api.abi.multiCall({
      target: contract,
      abi: abi.poolInfo2,
      calls,
      chain, block,
    })

    const tempBalances = {}
    const lps = []

    data.forEach(({ output }) => {
      const token = output.lpToken.toLowerCase()
      const amount = output.amount0
      sdk.util.sumSingleBalance(tempBalances, token, amount)
      lps.push(token)
    })
    
    // balances.staking['avax:' + vcs] = tempBalances[vcs]
    delete tempBalances[vcs]
    const pairs = await getLPData({ lps, chain, block })

    const { updateBalances, prices } = await getTokenPrices({ lps: Object.keys(pairs), allLps: true, 
      useDefaultCoreAssets: true, block, chain, minLPRatio: 0.001 })

    Object.entries(tempBalances).forEach(([token, balance]) => {
      if (pairs[token]) {
        const { token0Address, token1Address } = pairs[token]
        if (vcs === token0Address || vcs === token1Address) {
          sdk.util.sumSingleBalance(balances.pool2, transform(token), balance)
          return;
        }
      }
      sdk.util.sumSingleBalance(balances.tvl, transform(token), balance)
    })

    await updateBalances(balances.tvl)
    await updateBalances(balances.pool2)
    return balances
  }
}

async function tvl(_, _b, { [chain]: block }) {
  return (await gettotalTvl(block)).tvl
}

async function pool2(_, _b, { [chain]: block }) {
  return (await gettotalTvl(block)).pool2
}
/*
async function staking(_, _b, { [chain]: block }) {
  return (await gettotalTvl(block)).staking
}*/



module.exports = {
  hallmarks: [
    [1665187200, "Rug Pull"]
  ],
  misrepresentedTokens: true,
  avax: {
    tvl, 
    pool2, 
    staking:stakingPricedLP(contract,vcs,'avax','0x41ac9fd73298505dd1d2afc0b11cdd09fe3d7807','usd-coin',false,6)
  }
}