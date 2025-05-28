const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x2Ac995E7945472da0C1077a0A00E0CF914baE0cC"

async function tvl(time, ethBlock, { sonic: block }) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, block, chain: 'hyperliquid', })
}

module.exports = {
  methodology: `We count the HYPE on ${contract}`,
  hyperliquid: {
    tvl
  }
}
