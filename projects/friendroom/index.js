const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x9BD0474CC4F118efe56f9f781AA8f0F03D4e7A9c"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  ethereum: {
    tvl
  }
}
