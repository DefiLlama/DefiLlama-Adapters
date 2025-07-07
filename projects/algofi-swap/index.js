const { getConfig } = require('../helper/cache')
const { getAssetInfo, } = require("../helper/chain/algorand");

const blacklistedTokens = [
  '465865291',  // STBL
  '841126810',  // STBL2
]

async function dex(api) {
  let lpTokens = (await getConfig('algofi-swap',"https://api.algofi.org/ammLPTokens?network=MAINNET")).map(i => i.asset_id);
  // let lpTokens = (await getConfig('algofi-swap',"https://api.algofi.org/pools?network=MAINNET")).map(i => i.lp_asset_id);
  lpTokens = [...new Set(lpTokens)]
  const lpData = await Promise.all(lpTokens.map(getAssetInfo))
  lpData.forEach(({ assets }) => {
    Object.values(assets).forEach(i => {
      if (blacklistedTokens.includes(i['asset-id'])) return;
      api.add(i['asset-id'], i.amount)
    })
  })
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl: dex,
  }
}