const { sumTokens2 } = require('../helper/unwrapLPs')

const staticPoolStableToken = "0x55d398326f99059fF775485246999027B3197955" //usdt
const staticPool = "0x2b9C1F069Ddcd873275B3363986081bDA94A3aA3" // sigma staticPool
const sy = "0x8B98563d66B74e5a644BFf78fC72c86bbA847a29" // sigma token 1:1 slisBNB
const poolManager = "0x0a43ca87954ED1799b7b072F6E9D51d88Cca600E"

module.exports = {
  doublecounted: true,
  bsc: {
    tvl: async (api) => {
      const stableTotal = await api.call({ target: staticPool, abi: "uint256:totalStableToken" })
      api.add(staticPoolStableToken, stableTotal)
      await sumTokens2({ api, owners: [poolManager], tokens: [sy] })
    }
  },
};