const { sumTokens2 } = require('../helper/unwrapLPs')

const keyManagerContract = "0xfad362E479AA318F2De7b2c8a1993Df9BB2B3b1f"
const usdcBase = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [usdcBase], owner: keyManagerContract, api })
}

module.exports = {
  methodology: `Counts USDC on the KeyManager contract (${keyManagerContract})`,
  base: {
    tvl
  }
}