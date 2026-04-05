const { getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

// Meteora DAMM V2 Pool: DERPYDAVE/SOL
const POOL_ADDRESS = "BJ5468WZcJHK9uAgzoKSFJ26atrZQwVt2Rve5vvmJndq";

// Token addresses
const DERPYDAVE_MINT = "2wT8AcQFEzXMEjb6qbs1GDg3mJ3DKBw6eBWp7GqsBAGS";
const SOL_MINT = "So11111111111111111111111111111111111111112";

async function tvl() {
  const connection = getConnection();
  const poolPubkey = new PublicKey(POOL_ADDRESS);
  
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(poolPubkey, {
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
  });
  
  const balances = {};
  
  for (const account of tokenAccounts.value) {
    const info = account.account.data.parsed.info;
    const mint = info.mint;
    const amount = info.tokenAmount.uiAmount;
    
    if (mint === SOL_MINT) {
      balances["solana:" + SOL_MINT] = amount;
    } else if (mint === DERPYDAVE_MINT) {
      balances["solana:" + DERPYDAVE_MINT] = amount;
    }
  }
  
  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated from the permanently locked DERPYDAVE/SOL liquidity in the Meteora DAMM V2 pool.",
  solana: {
    tvl,
  },
};
