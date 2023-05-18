const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const chain = 'bsc'
const { getLPData, getTokenPrices, } = require('../helper/unknownTokens')
let totalTvl


const contract = '0xf300b9171aAb493F4584b8f5601d97E627AaB451'
const blur = '0x4165084a6e5388ce53c9d9892f904a2712dd943a'
const wbnb = ADDRESSES.bsc.WBNB
const sushi = '0x4165084A6e5388ce53c9D9892f904a2712Dd943A'
const busd = ADDRESSES.cronos.USDT

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

    balances.staking['bsc:' + blur] = tempBalances[blur]
    delete tempBalances[blur]

    const pairs = await getLPData({ lps, chain, block })

    const { updateBalances, } = await getTokenPrices({ lps: Object.keys(pairs), allLps: true, coreAssets: [ ], block, chain, minLPRatio: 0.001 })

    Object.entries(tempBalances).forEach(([token, balance]) => {
      if (pairs[token]) {
        const { token0Address, token1Address } = pairs[token]
        if (blur === token0Address || blur === token1Address) {
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
  bsc: {
    tvl: () => ({}),
  },
  hallmarks: [
    [Math.floor(new Date('2022-08-10')/1e3), 'Rug pull'],
  ],
}