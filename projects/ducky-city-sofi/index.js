const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xe276437b808741f5c73b867fde8f3fed8c326876"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl
  }
}
