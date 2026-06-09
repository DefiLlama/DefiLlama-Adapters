const { getTokenSupplies } = require('../helper/solana')

const NX8_MINT = 'NX8DuAWprqWAYDvpkkuhKnPfGRXQQhgiw85pCkgvFYk'

async function tvl(api) {
  await getTokenSupplies([NX8_MINT], api)
}

module.exports = {
  timetravel: false,
  methodology:
    "Total on-chain supply of the NX8 index token (Solana mint " +
    "NX8DuAWprqWAYDvpkkuhKnPfGRXQQhgiw85pCkgvFYk) valued at its market price.",
  solana: {
    tvl,
  },
}
