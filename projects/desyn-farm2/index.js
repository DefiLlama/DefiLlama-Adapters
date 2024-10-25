const { sumTokens2 } = require('../helper/unwrapLPs');

const corePool = '0x5e69d826D3663094321E2cf3C387b7F9Dd7b44Bb'

async function tvl(api) {
    const tokens = await api.multiCall({  abi: 'address[]:getCurrentTokens', calls: corePool})
    const ownerTokens = tokens.map((v, i) => [v, pools[i]])
    return sumTokens2({ ownerTokens, api })
}

module.exports = {
    doublecounted: true,
    core: {
      tvl,
    },
  };