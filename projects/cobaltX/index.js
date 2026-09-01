const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount, sumTokens2 } = require("../helper/solana");

const CobaltXProgram = {
  soon: "2TnjBuwqyBB9to5jURagDT7jLmBPefGRiKL2yh1zPZ4V",
  soon_bsc: "6f1b3xyVZbnWMHXBjgW1KPwxmPAgXcRdrvKNn4Nmf1Cn",
  soon_base: "6f1b3xyVZbnWMHXBjgW1KPwxmPAgXcRdrvKNn4Nmf1Cn",
}

async function tvl(api) {
  const programId = CobaltXProgram[api.chain];
  const connection = getConnection(api.chain);
  const allPoolKeyInfo = await connection.getProgramAccounts(new PublicKey(programId), { filters: [{ dataSize: 1544 }], })
  const tokenAccounts = allPoolKeyInfo.map(i => {
    const data = decodeAccount('byrealCLMM', i.account)
    return [data.vaultA.toString(), data.vaultB.toString()]
  }).flat()
  return sumTokens2({ api, tokenAccounts })
}

Object.keys(CobaltXProgram).forEach(chain => {
  module.exports[chain] = { tvl }
})