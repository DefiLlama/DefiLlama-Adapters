const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x38008f8a9dec4c688864ca4bae87c0bd080c0440"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl
  }
}
