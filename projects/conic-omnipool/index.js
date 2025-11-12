module.exports = {
  doublecounted: true,
  hallmarks: [
    // [1689937200,"ETH Omnipool Hacked"],
    [1741393291, 'Team decides to wind down the project'], 
  ],
  ethereum: {
    tvl: async (api) => {
      const poolsV1 = (await api.call({ abi: 'address[]:listPools', target: '0x013A3Da6591d3427F164862793ab4e388F9B587e' })).filter(i => i !== '0xb652710eab40B6Ed32D6c32053fC37eF234562c2')
      const poolsV2 = (await api.call({ abi: 'address[]:listPools', target: '0x2790EC478f150a98F5D96755601a26403DF57EaE' }))
      const pools = [...poolsV1, ...poolsV2]
      const bals = await api.multiCall({  abi: 'uint256:totalUnderlying', calls: pools, permitFailure: true })
      const tokens = await api.multiCall({  abi: 'address:underlying', calls: pools })
      pools.forEach((_, i) => {
        const bal = bals[i]
        const token = tokens[i]
        if (!bal || !token) return;
        api.add(token, bal)
      })

    }
  }
}
