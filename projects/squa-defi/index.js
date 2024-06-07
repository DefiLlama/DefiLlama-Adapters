const ADDRESSES = require('../helper/coreAssets.json')
const keyManagerContract = "0xfad362E479AA318F2De7b2c8a1993Df9BB2B3b1f"

async function tvl(time, ethBlock, _b, {api}) {
  return api.sumTokens({ tokens: [ADDRESSES.base.USDC], owner: keyManagerContract,  })
}

module.exports = {
  methodology: `Counts USDC on the KeyManager contract (${keyManagerContract})`,
  base: {
    tvl
  }
}