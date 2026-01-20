const abis = {
  totalValue: 'function totalValue() view returns (tuple(address tokenAddress, int256 value, uint8 decimals, int256 valueUsd, uint16 targetWeight, uint16 feeBasisPoints, uint16 taxBasisPoints, bool dynamicFee)[])'
}
const config = {
  cronos_zkevm: '0x02ae2e56bfDF1ee4667405eE7e959CD3fE717A05',
  cronos: '0xE6F6351fb66f3a35313fEEFF9116698665FBEeC9',
}

Object.keys(config).forEach(chain => {
  const moonlander = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const info = await api.call({  abi: abis.totalValue, target: moonlander})
      return api.sumTokens({ owner: moonlander, tokens: info.map(i => i.tokenAddress), })
    }
  }
})