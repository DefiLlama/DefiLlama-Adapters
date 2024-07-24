const { queryContract, } = require('../helper/chain/secret')
const { transformDexBalances } = require('../helper/portedTokens')
const { PromisePool } = require('@supercharge/promise-pool')
const sdk = require('@defillama/sdk')
const { sleep } = require('../helper/utils')

async function tvl(api) {
  const factiories = ["secret18sq0ux28kt2z7dlze2mu57d3ua0u5ayzwp6v2r", "secret1zvk7pvhtme6j8yw3ryv0jdtgg937w0g0ggu8yy"]
  const data = []
  await Promise.all(factiories.map(i => getExchanges(i, data)))
  return transformDexBalances({ data, chain: api.chain })
}

async function getExchanges(factory, data) {
  const pools = []
  const limit = 30
  let hasMore = true
  do {
    const { list_exchanges: { exchanges } } = await queryContract({ contract: factory, data: { list_exchanges: { pagination: { start: pools.length, limit } } } })
    hasMore = exchanges.length === limit

    sdk.log(factory, exchanges.length, pools.length, hasMore)
    pools.push(...exchanges)
    const { errors } = await PromisePool.withConcurrency(10)
      .for(exchanges)
      .process(async (i) => {
        let { address, contract } = i
        if (!address) address = contract.address
        const { pair_info } = await queryContract({ contract: address, data: "pair_info" })
        data.push({
          token0: transformToken(pair_info.pair.token_0, pair_info),
          token0Bal: pair_info.amount_0,
          token1: transformToken(pair_info.pair.token_1, pair_info),
          token1Bal: pair_info.amount_1,
        })
        await sleep(1000)
      })

    console.log(errors, errors.length, factory, exchanges.length, pools.length, hasMore)
    // if (errors && errors.length)
    //   throw errors[0]

  } while (hasMore)
}

function transformToken(addr, poolData) {
  if (!addr?.custom_token) {
    // console.log(JSON.stringify(addr, null, 2))
    // console.log(JSON.stringify(poolData, null, 2))
    throw new Error("No custom token")
  }
  return addr.custom_token.contract_addr
}

module.exports = {
  timetravel: false,
  secret: { tvl }
}