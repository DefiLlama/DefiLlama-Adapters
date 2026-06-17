const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

const WEALTHVILLE_PROGRAM_ID = new PublicKey("6dtupVYfD3UP6mEsBxExfHeiBNojC4QNHSysYNewkaGu");
const VAULT_DISCRIMINATOR = bs58.encode(Buffer.from("dae002b6f091b8d7", "hex"));

async function tvl(api) {
  const accounts = await getConnection().getProgramAccounts(WEALTHVILLE_PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: VAULT_DISCRIMINATOR } }],
  });
  const owners = accounts.map(({ pubkey }) => pubkey.toBase58());
  return sumTokens2({ api, owners, solOwners: owners });
}

module.exports = {
  methodology: "TVL counts all SPL token balances held in token accounts owned by WealthVille smart vault PDAs, representing user-deposited assets under automated yield management.",
  solana: { tvl },
};
