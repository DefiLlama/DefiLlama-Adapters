const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs');
const { cachedGraphQuery } = require('../helper/cache');

const FCTR = "0x6dD963C510c2D2f09d5eDdB48Ede45FeD063Eb36"
const veFCTR = "0xA032082B08B2EF5A6C3Ea80DaEac58300F68FB73"

async function tvl(api) {
  const endpoint = 'https://api.thegraph.com/subgraphs/name/yanuar-ar/factor-arbitrum'
  const res = await cachedGraphQuery('factor-v1', endpoint,  `{vaultGeneses { id }}`)
  const indices = res.vaultGeneses.map(v => v.id)
  const uBalances = await api.multiCall({ abi: 'uint256[]:underlyingAssetsBalance', calls: indices })
  const calls = []
  uBalances.forEach((v, i) => {
    v.forEach((_, j) => calls.push({ target: indices[i], params: j }))
  })
  const uData = await api.multiCall({ abi: 'function underlyingAssets(uint256) view returns (address,uint256,uint256)', calls })
  const tokensAndOwners = uData.map((v, i) => [v[0], calls[i].target])
  await sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  arbitrum: {
    tvl,
    staking: staking(veFCTR, FCTR)
  }
}
