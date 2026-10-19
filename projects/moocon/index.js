const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");

const PROGRAM_ID = new PublicKey("mooxHpyFXFemZDNmGQE8KxW93aK8eRVG51nbsK2H52v");
const VAULT_DISCRIMINATOR = "cJJWPqNMczr";

async function tvl(api) {
  const connection = getConnection();
  const vaults = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: VAULT_DISCRIMINATOR } }],
    dataSlice: { offset: 0, length: 0 },
  });
  return sumTokens2({ api, owners: vaults.map((v) => v.pubkey.toString()) });
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "TVL is assets deposited in Moocon vaults and supplied to the underlying yield source.",
  solana: { tvl },
};