const config = {
  arbitrum: {
    backstopPool: "0x337B03C2a7482c6eb29d8047eA073119dc68a29A",
  },
  base: {
    backstopPool: "0x50841f086891fe57829ee0a809f8B10174892b69",
  },
  berachain: {
    backstopPool: "0xfa158Cf7cD83F418eBD1326121810466972447F6",
  },
}

Object.keys(config).forEach((chain) => {
  const { backstopPool } = config[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await api.fetchList({ lengthAbi: 'getBackedPoolCount', itemAbi: 'getBackedPool', target: backstopPool })
      pools.push(backstopPool)
      const assets = await api.multiCall({ abi: 'address:asset', calls: pools })
      return api.sumTokens({ tokensAndOwners2: [assets, pools] })
    },
  };
});
