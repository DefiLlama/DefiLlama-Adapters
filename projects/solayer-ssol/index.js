const { sumTokens2, getConnection, } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const connection = getConnection();

  // add native SOL staking for sSOL
  const stakeAccount = await connection.getAccountInfo(new PublicKey('po1osKDWYF9oiVEGmzKA4eTs8eMveFRMox3bUKazGN2'))
  api.add(ADDRESSES.solana.SOL, Number(stakeAccount.data.readBigUint64LE(258)))

  return sumTokens2({
    balances: api.getBalances()
  })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "TVL is calculated by restaked native SOL in the Solayer staking pool",
  solana: { tvl },
};