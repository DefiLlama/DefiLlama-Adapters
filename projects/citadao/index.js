const { staking } = require('../helper/staking')
const { unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  return unwrapUniswapV3NFTs({
    owners: [
      '0xc8b1039928a98d7a272f6942d86814ed9d8f9f17',
      '0x3f96c580436dd59404ba612bf6d8079dc10f6f7e',
      '0xda62d109064138c14d45085b6e49568e1c0b4e23',
    ]
  })
}

module.exports = {
  ethereum: {
    tvl: () => 0,
    pool2: tvl,
    staking: staking('0x20891b408c35e0b7ece14df59f259be3c763f120', '0x3541a5c1b04adaba0b83f161747815cd7b1516bc'),
  }
}
