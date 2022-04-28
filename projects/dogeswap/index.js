const { sumTokens, } = require('../helper/unwrapLPs')


async function staking(timestamp, block) {

  const DOGE_STAKING_CONTRACT = '0xd688F6223c11F601420d716d88d8C1AD018711B8'
  const DOGES_TOKEN = '0xb4FBed161bEbcb37afB1Cb4a6F7cA18b977cCB25'
  const PUPPY_STAKING_CONTRACT = '0x7a455859C5Bbe2a87c9c76FB684174B6cd31242E'
  const PUPPY_TOKEN = '0xa9fb117df8d8a8e3db2f456078320548d6e107fa'

  const balances = {}
  await sumTokens(
    balances,
    [
      [DOGES_TOKEN, DOGE_STAKING_CONTRACT, ],
      [PUPPY_TOKEN, PUPPY_STAKING_CONTRACT, ],
    ],
    block,
  )

  return balances
}

module.exports = {
  ethereum: {
    staking,
    tvl: () => ({})
  },
}
