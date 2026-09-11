const configs = [
  { governance: '0x02ecef526f806f06357659fFD14834fe82Ef4B04', main: '0x8ECa806Aecc86CE90Da803b080Ca4E3A9b8097ad', fromBlock: 11841962, },
  { governance: '0x86E527BC3C43E6Ba3eFf3A8CAd54A7Ed09cD8E8B', main: '0x6dE5bDC580f55Bc9dAcaFCB67b91674040A247e3', fromBlock: 12810001, },
]

module.exports = {
  start: '2021-02-12', // 02/12/2021 @ 01:06pm UTC
  ethereum: {
    tvl: async (api) => {
      const ownerTokens = []
      const tokens0 = await api.fetchList({ lengthAbi: 'totalTokens', itemAbi: 'function getTokenAddress(uint16) view returns (address)', target: configs[0].governance })
      const tokens1 = await api.fetchList({ lengthAbi: 'totalUserTokens', itemAbi: 'function getTokenAddress(uint16) view returns (address)', target: configs[1].governance })

      ownerTokens.push([tokens0, configs[0].main])
      ownerTokens.push([tokens1, configs[1].main])
      return api.sumTokens({ ownerTokens })
    }
  },
};
