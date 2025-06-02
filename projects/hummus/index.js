const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  metis: {
    pools: [
      "0x248fD66e6ED1E0B325d7b80F5A7e7d8AA2b2528b", // main
      "0x5b7e71F6364DA1716c44a5278098bc46711b9516", // mai
      "0x9D73ae2Cc55EC84e0005Bd35Fd5ff68ef4fB8aC5", // busd
      "0x7AA7E41871B06f15Bccd212098DeE98d944786ab", // old
    ]
  },
}

async function tvl(api) {
  const { pools } = config[api.chain]
  const tokensArray = await api.multiCall({ abi: "address[]:getTokenAddresses", calls: pools })
  const tokens = tokensArray.flat()
  const calls = tokensArray.map((t, i) => t.map((token) => ({ target: pools[i], params: token }))).flat()
  const owners = await api.multiCall({ abi: "function assetOf(address) view returns (address)", calls })
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], });
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})