const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x8F5Af913D42DbC296d0e184B6356EC4256029D09"

async function tvl(api) {
  return sumTokens2({ tokens: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  ], owners: [
    contract
  ], api })
}

module.exports = {
  methodology: 'We count the number of USDC locked in the contract. A proportional amount of ZKX USDC was minted in Starknet',
  ethereum: {
    tvl
  }
}