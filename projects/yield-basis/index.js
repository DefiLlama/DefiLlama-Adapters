const ADDRESSES = require('../helper/coreAssets.json')


const abi = {
  "markets": "function markets(uint256 arg0) view returns ((address asset_token, address cryptopool, address amm, address lt, address price_oracle, address virtual_pool, address staker))",
  "market_count": "uint256:market_count",
}

const config = {
  ethereum: { factory: '0x370a449FeBb9411c95bf897021377fe0B7D100c0', crvUSD: ADDRESSES.ethereum.CRVUSD }
}

Object.keys(config).forEach(chain => {
  const { factory, crvUSD, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const markets = await api.fetchList({ lengthAbi: abi.market_count, itemAbi: abi.markets, target: factory })

      const lpBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: markets.map(i => ({ target: i.cryptopool, params: i.amm })) })
      const crvUSDDebt = await api.multiCall({ abi: 'uint256:get_debt', calls: markets.map(i => i.amm) })
      const lpSupply = await api.multiCall({ abi: 'erc20:totalSupply', calls: markets.map(i => i.cryptopool) })
      const balanceInLpPools = await api.multiCall({ abi: 'erc20:balanceOf', calls: markets.map(lp => ({ target: lp.asset_token, params: lp.cryptopool })) })
      const crvUSDbalanceInLpPools = await api.multiCall({ abi: 'erc20:balanceOf', calls: markets.map(lp => ({ target: crvUSD, params: lp.cryptopool })) })
      const tokensAndOwners = markets.map((m,) => [m.asset_token, m.amm])  // check if any token is retain in amm contract and put in curve lp contract


      balanceInLpPools.forEach((v, i) => {
        const ratio = lpBalances[i] / lpSupply[i]
        api.add(markets[i].asset_token, v * ratio)
        api.add(crvUSD, crvUSDbalanceInLpPools[i] * ratio)
        api.add(crvUSD, crvUSDDebt[i] * -1)
      })


      return api.sumTokens({ tokensAndOwners })
    }
  }
})

module.exports.doublecounted = true  // all the tokens end up on curve
module.exports.methodology = `Tvl is the value of LP tokens in curve pools minus the value of borrowed crvUSD tokens`