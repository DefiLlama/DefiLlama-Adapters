const sdk = require("@defillama/sdk")
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const chain = 'okexchain'
const { getLPData, getTokenPrices, } = require('../helper/unknownTokens')
let totalTvl

const contract = '0x1bb44D416620902a7f8AdF521422751A9f86d213'
const claw = '0x796294Cd49c81923391e869684Cf463646587133'

async function gettotalTvl(block) {
  if (!totalTvl) totalTvl = getTVL()
  return totalTvl

  async function getTVL() {
    const transform = await getChainTransform(chain)
    const balances = {
      tvl: {},
      pool2: {},
      staking: {},
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
      abi: abi.poolInfo,
      calls,
      chain, block,
    })

    const tempBalances = {}
    const lps = []
    data.forEach(({ output }) => {
      const token = output.lpToken.toLowerCase()
      const amount = output.amount
      sdk.util.sumSingleBalance(tempBalances, token, amount)
      lps.push(token)
    })
    if(tempBalances[claw]) {
      balances.staking['okexchain:' + claw] = tempBalances[claw]
    }
    delete tempBalances[claw]

    const pairs = await getLPData({ lps, chain, block })

    const { updateBalances, } = await getTokenPrices({ lps: Object.keys(pairs), allLps: true, coreAssets: [ ], block, chain, minLPRatio: 0.001 })

    Object.entries(tempBalances).forEach(([token, balance]) => {
      if (pairs[token]) {
        const { token0Address, token1Address } = pairs[token]
        if (claw === token0Address || claw === token1Address) {
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

async function staking(_, _b, { [chain]: block }) {
  return (await gettotalTvl(block)).staking
}



module.exports = {
  okexchain: {
    tvl, pool2, staking
  }
}