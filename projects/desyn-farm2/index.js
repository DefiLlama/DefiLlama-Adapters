const corePool = '0x5e69d826D3663094321E2cf3C387b7F9Dd7b44Bb'

async function tvl(api) {
    const tokens = await api.multiCall({  abi: 'address[]:getCurrentTokens', calls: corePool})
    return api.sumTokens({ ownerTokens: tokens.map((tokens, i) => [tokens, pools[i]])})
}

module.exports = {
    doublecounted: true,
    core: {
      tvl,
    },
  };