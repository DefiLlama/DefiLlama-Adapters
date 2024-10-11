
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const HONO = '0x8F5ac7F3cfeFfB6EB638A8aDd2d32661F82C03FD'
const uniV3LP = '0xc4824156785be733d9b98ac4813da0c7bc1b7a44'

async function tvl(api) {
  await api.sumTokens({ owner: HONO, tokens: [nullAddress]})
  return sumTokens2({ api, owner: uniV3LP, resolveUniV3: true, blacklistedTokens: [HONO]})

}
module.exports = {
  methodology: 'The combined value of two components: the total value of ETH supporting the HONO price and the amount of liquidity being managed by our income strategies.',
  ethereum: {
    tvl,
  },
};
