const { getConnection, decodeAccount, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require("@solana/web3.js")
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(_, _1, _2, { api }) {
  const connection = getConnection()
//   const programPublicKey = new PublicKey('5ocnV1qiCgaQR8Jb8xWnVbApfaygJ8tNoZfgPwsgx9kx')
  const stakeAccount = new PublicKey('5oc4nmbNTda9fx8Tw57ShLD132aqDK65vuHH4RU1K4LZ')
  const data = await connection.getAccountInfo(stakeAccount)
  const i = decodeAccount('scnStakePool', data)
  api.add(ADDRESSES.solana.SOL, i.totalStakeLamports.toString())
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
