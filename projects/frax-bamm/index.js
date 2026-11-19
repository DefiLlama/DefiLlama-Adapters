const { sumUnknownTokens } = require('../helper/unknownTokens')

module.exports = {
  methodology: "Sums the TVL of all Bamms Deployed via the factory",
};

const config = {
  fraxtal: {
    factory: "0x19928170D739139bfbBb6614007F8EEeD17DB0Ba"
  }
};


Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const bamms = await api.fetchList({ lengthAbi: 'bammsLength', itemAbi: 'bamms', target: factory })
      const token0s = await api.multiCall({ abi: 'address:token0', calls: bamms })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: bamms })
      const pairs = await api.multiCall({ abi: 'address:pair', calls: bamms })
      const ownerTokens = bamms.map((v, i) => [[token0s[i], token1s[i], pairs[i]], v])
      return sumUnknownTokens({ api, ownerTokens, useDefaultCoreAssets: true, lps: pairs })
    },
    borrowed: async (api) => {
      const bamms = await api.fetchList({ lengthAbi: 'bammsLength', itemAbi: 'bamms', target: factory })
      const pairs = await api.multiCall({ abi: 'address:pair', calls: bamms })
      const token0s = await api.multiCall({ abi: 'address:token0', calls: pairs })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: pairs })
      const reserves = await api.multiCall({ abi: 'function getReserves() view returns (uint112, uint112, uint32)', calls: pairs })
      const sqrtRenteds = await api.multiCall({ abi: 'uint256:sqrtRented', calls: bamms })
      const rentedMultipliers = await api.multiCall({ abi: 'uint256:rentedMultiplier', calls: bamms })

      pairs.forEach((_, i) => {
        const sqrtR = Number(sqrtRenteds[i])
        if (!sqrtR) return
        const r0 = Number(reserves[i][0])
        const r1 = Number(reserves[i][1])
        if (!r0 || !r1) return
        const fraction = sqrtR * Number(rentedMultipliers[i]) / 1e18 / Math.sqrt(r0 * r1)
        api.add(token0s[i], r0 * fraction)
        api.add(token1s[i], r1 * fraction)
      })
      return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: pairs })
    }
  }
})