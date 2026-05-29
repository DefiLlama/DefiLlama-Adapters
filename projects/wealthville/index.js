const { PublicKey, Connection } = require("@solana/web3.js");

const WEALTHVILLE_PROGRAM_ID = "6dtupVYfD3UP6mEsBxExfHeiBNojC4QNHSysYNewkaGu";

async function tvl(api) {
  const connection = new Connection(
    process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com"
  );
  const accounts = await connection.getProgramAccounts(
    new PublicKey(WEALTHVILLE_PROGRAM_ID)
  );
  await Promise.all(
    accounts.map(async ({ pubkey }) => {
      try {
        const balance = await connection.getTokenAccountBalance(pubkey);
        if (balance.value && balance.value.uiAmount > 0) {
          api.add(balance.value.mint, balance.value.uiAmount);
        }
      } catch (_) {}
    })
  );
}

module.exports = {
  methodology:
    "Sums all token balances held in WealthVille smart vault accounts on Solana, " +
    "representing user-deposited assets under automated yield management.",
  solana: { tvl },
};
