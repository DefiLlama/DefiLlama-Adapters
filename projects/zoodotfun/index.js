const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x722122A1940B5c20Ac55e524b6ED7a2AA5172b87"

async function tvl({api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  abstract: {
    tvl
  }
}
