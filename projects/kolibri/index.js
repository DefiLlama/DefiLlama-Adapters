const sdk = require('@defillama/sdk')
const { getStorage, getTokenBalances } = require('../helper/chain/tezos')

const tezos = sdk.chains.tezos

const OVEN_FACTORY = 'KT1Mgy95DVzqVBNYhsW93cyHuB57Q94UFhrh'
const KUSD_XTZ_QUIPU_LP = 'KT1K4EwTpbvYN9agJdjpyJm4ZZdhpUNKB3F6'
const KUSD_LP_FARM = 'KT1RB179ddATKbCi7E8ben91bo2hqRRPrNQf' // kUSD LP - kDAO farming

// every oven is originated by the oven factory and holds its XTZ collateral directly
async function tvl(api) {
  const ovens = await tezos.tzktAll({ path: '/v1/contracts', params: { creator: OVEN_FACTORY, 'balance.gt': 1e5, select: 'balance' } })
  ovens.forEach(balance => api.add('coingecko:tezos', balance / 1e6, { skipChain: true }))
}

async function pool2(api) {
  const farmLp = (await getTokenBalances(KUSD_LP_FARM, false, { transformAddress: i => i }))[KUSD_XTZ_QUIPU_LP]
  if (!farmLp) return
  const { storage } = await getStorage(KUSD_XTZ_QUIPU_LP)
  const ratio = farmLp / storage.total_supply
  api.add('coingecko:tezos', storage.tez_pool * ratio / 1e6, { skipChain: true })
  api.add(storage.token_address, storage.token_pool * ratio)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts the XTZ deposited in ovens to mint kUSD. Pool2 counts the kUSD/XTZ Quipuswap LP staked in the kDAO farm. Borrowed tokens are not counted.',
  tezos: {
    tvl,
    pool2,
  },
}
