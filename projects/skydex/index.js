const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  era: {
    pools: [
      "0xe59eA42466f3dD0ea620A622701085983A068863",
      "0x33b4424A65cfE19CDf0Dff4E54e399782327a1b6",
    ]
  },
  base: {
    pools: [
      "0x40e004A3312259EE0cA3F457d67D13d4FEec311E",
      "0xBDA235257f1cFb3833594cB8faE394BC1826caD3",
    ]
  },
}

const blacklistedTokens = []

async function tvl(api) {
  const { pools } = config[api.chain]
  const tokensArray = await api.multiCall({ abi: "address[]:getTokens", calls: pools })
  const tokens = tokensArray.flat()
  const calls = tokensArray.map((t, i) => t.map((token) => ({ target: pools[i], params: token }))).flat()
  const owners = await api.multiCall({ abi: "function assetOf(address) view returns (address)", calls })
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens });
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})