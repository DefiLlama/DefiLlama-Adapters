const { unwrapLPsAuto } = require('../helper/unwrapLPs')

const config = {
  bsc: { gaugeFactory: '0x3Bb920C4875411C40981f6eb6959d4e169877A66' },
  arbitrum: { gaugeFactory: '0x01A07719596713bE5aB1C3AeEA76e3f5fde0885d' },
  polygon: { gaugeFactory: '0x3F316559EB4f493C75638425106144261e20F3a2' },
}

const totalAmountAbi = "function getTotalAmounts() view returns (uint256 total0, uint256 total1)"
const guageAbiBsc = "function gaugeListExtended() view returns (address[], address[], uint16[])"
const guageAbi = "function gaugeListExtended() view returns (address[], address[])"

Object.keys(config).forEach(chain => {
  const { gaugeFactory } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const [gauges] = await api.call({ abi: chain === 'bsc' ? guageAbiBsc : guageAbi, target: gaugeFactory })
      const tokens = await api.multiCall({ abi: 'address:TOKEN', calls: gauges })
      const bals = (await api.multiCall({ abi: 'uint256:balance', calls: gauges, permitFailure: true })).map(i => i ?? 0)
      const isHypervisor = await api.multiCall({ abi: totalAmountAbi, calls: tokens, permitFailure: true })
      const items = gauges.map((gauge, i) => ({
        gauge,
        token: tokens[i],
        balance: bals[i],
        isHypervisor: !!isHypervisor[i]
      })).filter(i => i.balance > 0)
      const hypervisorItems = items.filter(i => i.isHypervisor)
      const lpItems = items.filter(i => !i.isHypervisor)
      lpItems.forEach(i => api.add(i.token, i.balance))
      const hypTokens = hypervisorItems.map(i => i.token)
      const hypToken0s = await api.multiCall({ abi: 'address:token0', calls: hypTokens })
      const hypToken1s = await api.multiCall({ abi: 'address:token1', calls: hypTokens })
      const hypTotalSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: hypTokens })
      const hypTokenBals = await api.multiCall({ abi: totalAmountAbi, calls: hypTokens })
      hypTokens.forEach((_, i) => {
        const ratio = hypervisorItems[i].balance / hypTotalSupplies[i]
        api.add(hypToken0s[i], hypTokenBals[i][0] * ratio)
        api.add(hypToken1s[i], hypTokenBals[i][1] * ratio)
      })
      return unwrapLPsAuto({ api,})
    }
  }
})