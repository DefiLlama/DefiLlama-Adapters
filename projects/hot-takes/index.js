const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xfedA2BAE8F800E990fF3f0848eBd7Eb24b4f6408"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the AVAX on ${contract}`,
  avax: {
    tvl
  }
}