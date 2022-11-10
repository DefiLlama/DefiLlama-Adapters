const { staking } = require("../helper/staking");
const constants = require("./constants");
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks["polygon"];
  const toa = []
  for (const key in constants)
    for (const { token, lpTokens } of constants[key].addresses)
      lpTokens.forEach(i => toa.push([token, i]))
  return sumTokens2({ chain: 'polygon', block, tokensAndOwners: toa, })
}

module.exports = {
  polygon:{
    tvl,
    staking: staking(
      "0xfD5D4caDe98366d0b09c03cB3cEe7D244c8b6146", //ve
      "0xE0f463832295ADf63eB6CA053413a3f9cd8bf685", //snow
      "polygon"
    ),
  },
};
