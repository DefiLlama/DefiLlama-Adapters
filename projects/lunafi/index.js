const sdk = require('@defillama/sdk');
const { transformPolygonAddress } = require('../helper/portedTokens');
const { tokens, pools } = require("./config");

Array.prototype.forEachAsync = async function (fn) {
  for (let t of this) { await fn(t) }
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();

  await pools.forEachAsync(async pool => {

    await tokens.forEachAsync(async token => {

      const poolBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: 'polygon',
        target: token,
        params: [pool],
        block: chainBlocks['polygon'],
      })).output;

      sdk.util.sumSingleBalance(balances, transform(token), poolBalance)
    })
  })

  return balances;
}

module.exports = {
  polygon: {
    tvl,
  }
};