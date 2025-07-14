const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount, sumTokens2 } = require("../helper/solana");

async function tvl(api) {
  const connection = getConnection(api.chain);
  const programId = '2TnjBuwqyBB9to5jURagDT7jLmBPefGRiKL2yh1zPZ4V'
  const allPoolKeyInfo = await connection.getProgramAccounts(new PublicKey(programId), { filters: [{ dataSize: 1544 }],  })
  const tokenAccounts = allPoolKeyInfo.map(i => {
    const data = decodeAccount('byrealCLMM', i.account)
    return [data.vaultA.toString(), data.vaultB.toString()]
  }).flat()
  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  soon: { tvl }
}