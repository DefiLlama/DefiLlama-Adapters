const { getConnection, ASSOCIATED_TOKEN_PROGRAM_ID, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const crypto = require('crypto');
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');

async function tvl(api) {
  const connection = getConnection();

  const marketStateAccounts = await connection.getProgramAccounts(
    new PublicKey('mnCk3moW6q9UszVev3C9JjtE4YoviXgLwiLCnUy3c4D'),
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(crypto.createHash('sha256').update("account:MarketState").digest().slice(0, 8)),
          },
        },
      ]
    }
  );

  const tokenAccounts = []

  for (const account of marketStateAccounts) {
    const owner = account.pubkey;
    const mint = new PublicKey(account.account.data.slice(48, 80));

    const mintAccountInfo = await connection.getAccountInfo(mint);
    const tokenProgramId = mintAccountInfo.owner;

    const [associatedTokenAddress] = PublicKey.findProgramAddressSync(
      [owner.toBuffer(), tokenProgramId.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    tokenAccounts.push(associatedTokenAddress.toBase58());
  }

  return sumTokens2({
    tokenAccounts,
    balances: api.getBalances()
  })
}

module.exports = {
  timetravel: false,
  methodology: "Aggregate Token Value in the Mooncake Protocol",
  solana: { tvl },
};