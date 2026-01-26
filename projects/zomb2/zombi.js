const { sumTokensExport } = require("../helper/unknownTokens");

function zombiTvl(token, share, rewardPool, rewardPool2, masonry, pool2LPs, listedTokenGeneris, chain = "ethereum", transform = undefined, tokensOnCoingecko = true, lpWithShare = undefined) {

  return {
    [chain]: {
      tvl: () => ({}),
      staking: sumTokensExport({ owner: masonry, tokens: [share], lps: [lpWithShare], useDefaultCoreAssets: true, }),
      pool2: sumTokensExport({ owners: [rewardPool, rewardPool2,], tokens: pool2LPs.concat(listedTokenGeneris), lps: pool2LPs, useDefaultCoreAssets: true, }),
    }
  }
}

module.exports = {
  zombiTvl
}