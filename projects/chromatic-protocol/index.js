const config = require("./config")
const { sumTokens2 } = require("../helper/unwrapLPs")
const abi = require("./abi.json")
const marketFactory = "0x0b216AB26E20d6caA770B18596A3D53B683638B4"
const lpRegistry = "0xc337325525eF17B7852Fd36DA400d3F9eEd51A4a"

async function arbitrum_tvl(_, _1, _2, { api }) {
  const settlementTokens = await api.call({
    target: marketFactory,
    abi: abi.registeredSettlementTokens,
  })
  const lpAddressesBySettlementToken = (
    await Promise.all(
      settlementTokens.map(async (settlementToken) => {
        const lpAddresses = await api.call({
          target: lpRegistry,
          abi: abi.lpListBySettlementToken,
          params: [settlementToken],
        })
        return {
          [settlementToken]: lpAddresses,
        }
      })
    )
  ).reduce((acc, curr) => ({ ...acc, ...curr }), {})

  const tokensAndOwners = Object.entries(lpAddressesBySettlementToken).map(
    ([settlementToken, lpAddresses]) => {
      return lpAddresses.map((lpAddress) => [settlementToken, lpAddress])
    }
  ).flat()
  const deprecatedPools = config.arbitrum.pools.USDT.BTC.map((pool) => {
    return [config.arbitrum.tokens.USDT, pool.address]
  })
  
  tokensAndOwners.push(...deprecatedPools)
  tokensAndOwners.push([config.arbitrum.tokens.USDT, config.arbitrum.vault])

  return sumTokens2({
    api,
    tokensAndOwners,
  })
}

module.exports = {
  arbitrum: {
    tvl: arbitrum_tvl,
  },
}
