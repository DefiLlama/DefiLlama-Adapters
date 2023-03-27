const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs');

const FCTR = "0x6dD963C510c2D2f09d5eDdB48Ede45FeD063Eb36"
const veFCTR = "0xA032082B08B2EF5A6C3Ea80DaEac58300F68FB73"
const FCTR_RNDTX = "0x95C34a4efFc5eEF480c65E2865C63EE28F2f9C7e" // Factor Roundtable Index

const indices = [FCTR_RNDTX]

async function tvl(timestamp, block, chainBlocks, { api }) {
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
