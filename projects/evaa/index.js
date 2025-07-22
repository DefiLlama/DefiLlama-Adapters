
const ADDRESSES = require('../helper/coreAssets.json')
const { call, sumTokens } = require("../helper/chain/ton");
const evaaPoolAssets = require("./evaaPoolAssets");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function borrowed(api) {
  for (const poolAssets of Object.values(evaaPoolAssets)) {
    for (const { assetId, address } of poolAssets.assets) {
      const [_totalSupply, totalBorrow] = await call({
        target: poolAssets.poolAddress,
        abi: 'getAssetTotals',
        params: [["int", assetId]]
      });
      api.add(address, totalBorrow)
      await sleep(3000)
    }
  }
}

async function tvl(api) {
  const owners = Object.values(evaaPoolAssets).map(pool => pool.poolAddress);
  return sumTokens({ owners, api, tokens: [ADDRESSES.null], useTonApiForPrices: true })
}

module.exports = {
  methodology: 'Counts the supply of EVAA\'s asset pools as TVL.',
  ton: { tvl, borrowed }
}
