const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { cachedGraphQuery } = require('../helper/cache')

const blacklistedTokens = []
const query = `{
  pools {
    id
    name
    assetsList { id token { id } }
  }
}`

async function tvl(api) {
  if (api.timestamp > +new Date("2023-02-17") / 1e3) blacklistedTokens.push("0xdaCDe03d7Ab4D81fEDdc3a20fAA89aBAc9072CE2") // USP was hacked
  const { pools } = await cachedGraphQuery("platypus-finance", sdk.graph.modifyEndpoint('Bu5QPRWGnZB6NxU4S7kAKQZJpY4pHmAq3TV69V1W2Qqw'), query)
  console.log(pools)
  const tokensAndOwners = pools.map(i => i.assetsList.map(v => [v.token.id, v.id])).flat()
  return sumTokens2({ api, tokensAndOwners, blacklistedTokens });
}

module.exports = {
  avax: {
    tvl,
    staking: staking(
      "0x5857019c749147eee22b1fe63500f237f3c1b692",
      "0x22d4002028f537599be9f666d1c4fa138522f9c8",
    ),
  },
  hallmarks: [
    [Math.floor(new Date('2023-02-17') / 1e3), 'Protocol was hacked for $8.5m'],
    [Math.floor(new Date('2023-10-12') / 1e3), 'Protocol was hacked for $2m'],
    [1716811215,"Acquired by Stable Jack"]
  ],
};
