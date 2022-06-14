const sdk = require("@defillama/sdk")
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
let allTvl
const chain = 'cronos'
const { getLPData, getTokenPrices, } = require('../helper/unknownTokens')


const contract = '0x596008a6fb314a18100f36209635853d7ea80eba'
const crown = '0xf287e8999fcbea602d2c5dd699ea2ff7f3685964'
const tether = '0x66e428c3f67a68878562e79a0234c1f83c208770'

async function getAllTVL(block) {
  if (!allTvl) allTvl = getTVL()
  return allTvl

  async function getTVL() {
    const transform = await getChainTransform(chain)
    const balances = {
      tvl: {},
      staking: {},
      pool2: {},
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
      if (token === crown) sdk.util.sumSingleBalance(balances.staking, transform(token), amount)
      else sdk.util.sumSingleBalance(tempBalances, token, amount)
      lps.push(token)
    })

    const pairs = await getLPData({ lps, chain, block })

    const { updateBalances, } = await getTokenPrices({ lps: Object.keys(pairs), allLps: true, coreAssets: [tether], block, chain, minLPRatio: 0.001 })
    Object.entries(tempBalances).forEach(([token, balance]) => {
      if (pairs[token]) {
        const { token0Address, token1Address } = pairs[token]
        if (crown === token0Address || crown === token1Address) {
          sdk.util.sumSingleBalance(balances.pool2, transform(token), balance)
          return;
        }
      }
      sdk.util.sumSingleBalance(balances.tvl, transform(token), balance)
    })

    await updateBalances(balances.tvl)
    await updateBalances(balances.pool2)
    await updateBalances(balances.staking)

    return balances
  }
}

async function tvl(_, _b, { [chain]: block }) {
  return (await getAllTVL(block)).tvl
}

async function pool2(_, _b, { [chain]: block }) {
  return (await getAllTVL(block)).pool2
}

async function staking(_, _b, { [chain]: block }) {
  return (await getAllTVL(block)).staking
}



module.exports = {
  cronos: {
    tvl,
    staking,
    pool2,
  }
}