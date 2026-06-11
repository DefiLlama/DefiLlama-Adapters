const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const WEALTHVILLE_PROGRAM_ID = "6dtupVYfD3UP6mEsBxExfHeiBNojC4QNHSysYNewkaGu";

async function tvl(api) {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(
    new PublicKey(WEALTHVILLE_PROGRAM_ID)
  );
  const owners = accounts.map(({ pubkey }) => pubkey.toBase58());
  return sumTokens2({ api, owners });
}

module.exports = {
  methodology:
    "TVL is the sum of all SPL token balances held in token accounts owned by " +
    "WealthVille smart vault PDAs, representing user-deposited assets under " +
    "automated yield management.",
  solana: { tvl },
};
