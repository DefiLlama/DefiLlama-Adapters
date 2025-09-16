const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const staticPoolStableToken = ADDRESSES.bsc.USDT //usdt
const staticPool = "0x2b9C1F069Ddcd873275B3363986081bDA94A3aA3" // sigma staticPool
const sy = "0x8B98563d66B74e5a644BFf78fC72c86bbA847a29" // sigma token 1:1 slisBNB
const poolManager = "0x0a43ca87954ED1799b7b072F6E9D51d88Cca600E"
const longPool = '0x31c464Cfe506d44CEaA86C05CDBB94b5c94f70fb' // WBNB long pool 
const longPoolToken = ADDRESSES.bsc.WBNB // WBNB

module.exports = {
  doublecounted: true,
  bsc: {
    tvl: async (api) => {
      const stableTotal = await api.call({ target: staticPool, abi: "uint256:totalStableToken" })
      api.add(staticPoolStableToken, stableTotal)
      const rawColls = await api.call({ target: longPool, abi: "uint256:getTotalRawCollaterals" })
      api.add(longPoolToken, rawColls)
      await sumTokens2({ api, owners: [poolManager], tokens: [sy] })
    }
  },
};