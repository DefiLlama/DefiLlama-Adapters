// https://www.starknetjs.com/docs/API/contract

const { validateAndParseAddress, Provider, Contract, } = require('starknet')
const abi = require('./abi')
const { transformDexBalances } = require('../helper/portedTokens')

async function tvl() {
  const provider = new Provider({
    sequencer: {
      network: 'mainnet-alpha'
    }
  })
  const factory = new Contract(abi.fabis, '0xdad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd', provider)
  const res = await factory.get_all_pairs()
  const pairs = res[0].map(i => validateAndParseAddress(i))
  const data = []
  let promises = []
  for (let pair of pairs) {
    promises.push(addPair(pair))
  }
  await Promise.all(promises)
  return transformDexBalances({chain:'starknet', data})

  async function addPair(pairStr) {
    pair = new Contract(abi.pabis, pairStr, provider)
    let [ token0, token1, reserves ] = await Promise.all([
      pair.token0(),
      pair.token1(),
      pair.get_reserves(),
    ])
    data.push({
      token0: validateAndParseAddress(token0.address),
      token1: validateAndParseAddress(token1.address),
      token0Bal: +reserves.reserve0,
      token1Bal: +reserves.reserve1,
    })
  }
}

module.exports = {
  timetravel: false,
  starknet: {
    tvl,
  }
}