const { aaveExports } = require('../helper/aave')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { mergeExports } = require('../helper/utils')

const v1PoolCore = "0xAF106F8D4756490E7069027315F4886cc94A8F73"

const v1Exports = {
  borrowed: async (api) => {
    const tokens = await api.call({ abi: "address[]:getReserves", target: v1PoolCore })
    const bals = await api.multiCall({ abi: "function getReserveTotalBorrows(address _reserve) view returns (uint256)", calls: tokens, target: v1PoolCore })
    api.add(tokens, bals)
    return api.getBalances()
  },
  tvl: async (api) => {
    const tokens = await api.call({ abi: "address[]:getReserves", target: v1PoolCore })
    return sumTokens2({ api, owner: v1PoolCore, tokens, })
  },
}
const v2Exports = aaveExports('', "0xF03982910d17d11670Dc3734DD73292cC4Ab7491", undefined, ["0x43d067ed784D9DD2ffEda73775e2CC4c560103A1"])

// v2 addresses on https://github.com/moolamarket/moola-v2/commit/ab273248af81aa743310b4fd48533462aefe39e9
module.exports = mergeExports([{
  methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
  celo: v1Exports
}, { celo: v2Exports }])