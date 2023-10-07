const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xa481b139a1a654ca19d2074f174f17d7534e8cec"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  hallmarks: [
    [1696654800,"Reentrancy Attack"]
  ],
  methodology: `We count the AVAX on ${contract}`,
  avax: {
    tvl
  }
}