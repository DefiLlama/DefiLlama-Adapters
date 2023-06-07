const { unwrapLPsAuto } = require('../helper/unwrapLPs')

const config = {
  bsc: { voters: ['0x3Bb920C4875411C40981f6eb6959d4e169877A66', '0xaE0439eC64985D4165d12dDE7F514D092B4C0E23'] },
  arbitrum: { voters: ['0x01A07719596713bE5aB1C3AeEA76e3f5fde0885d', '0xF995f72445B14ae8D56523C9A0dE3F03334BFE2C'] },
  polygon: { voters: ['0x3F316559EB4f493C75638425106144261e20F3a2', '0xf999009fF931749a0930B8db02C6Cd888c7DC5ED'] },
}

const totalAmountAbi = "function getTotalAmounts() view returns (uint256 total0, uint256 total1)"
const guageAbiBsc = "function gaugeListExtended() view returns (address[], address[], uint16[])"
const guageAbi = "function gaugeListExtended() view returns (address[], address[])"

Object.keys(config).forEach(chain => {
  const { voters } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const res = await api.multiCall({ abi: chain === 'bsc' ? guageAbiBsc : guageAbi, calls: voters })
      let gauges = res.flatMap(i => i[0])
      gauges = [...new Set(gauges.map(i => i.toLowerCase()))]
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