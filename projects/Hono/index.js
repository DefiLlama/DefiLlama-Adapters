
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const HONO = '0x8F5ac7F3cfeFfB6EB638A8aDd2d32661F82C03FD'
const uniV3LP = '0xc4824156785be733d9b98ac4813da0c7bc1b7a44'

async function tvl(timestamp, block, _, { api }) {
  await api.sumTokens({ owner: HONO, tokens: [nullAddress]})
  return sumTokens2({ api, owner: uniV3LP, resolveUniV3: true, blacklistedTokens: [HONO]})

}
module.exports = {
  methodology: 'TVL will be the sum of 1- total value ofETH backing HONO price and 2- Amount of LP managing by our LP Manager contract minus HONO in LP',
  ethereum: {
    tvl,
  },
};
