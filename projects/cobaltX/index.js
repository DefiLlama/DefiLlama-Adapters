
module.exports = {
  bsc: {
    tvl: async (api) => {
      const token = await api.call({ abi: 'address:asset', target: '0xcC48B55F6c16d4248EC6D78c11Ba19c1183Fe0F7' })
      const bal = await api.call({ abi: 'uint256:totalAssets', target: '0xcC48B55F6c16d4248EC6D78c11Ba19c1183Fe0F7' })
      api.add(token, bal)
    },
  },
}
