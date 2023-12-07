const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x69B7F08B2952e2EE3CA4222190BCF07831f1096f"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owners: [contract, '0x563395A2a04a7aE0421d34d62ae67623cAF67D03', '0xa481b139a1a654ca19d2074f174f17d7534e8cec'], api })
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