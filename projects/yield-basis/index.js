

const abi = {
  "markets": "function markets(uint256 arg0) view returns ((address asset_token, address cryptopool, address amm, address lt, address price_oracle, address virtual_pool, address staker))",
  "market_count": "uint256:market_count",
}

const config = {
  ethereum: { factory: '0x370a449FeBb9411c95bf897021377fe0B7D100c0' }
}

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const markets = await api.fetchList({ lengthAbi: abi.market_count, itemAbi: abi.markets, target: factory })

      const lpBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: markets.map(i => ({ target: i.cryptopool, params: i.amm })) })
      const lpSupply = await api.multiCall({ abi: 'erc20:totalSupply', calls: markets.map(i => i.cryptopool) })
      const balanceInLpPools = await api.multiCall({ abi: 'erc20:balanceOf', calls: markets.map(lp => ({ target: lp.asset_token, params: lp.cryptopool })) })
      const tokensAndOwners = markets.map((m, i) => [m.asset_token, m.amm])  // check if any token is retain in amm contract and put in curve lp contract


      balanceInLpPools.forEach((v, i) => {
        const ratio = lpBalances[i] / lpSupply[i]
        api.add(markets[i].asset_token, v * ratio)
      })


      return api.sumTokens({ tokensAndOwners })
    }
  }
})

module.exports.doublecounted = true  // all the tokens end up on curve