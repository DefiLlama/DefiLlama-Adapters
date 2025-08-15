const { PublicKey } = require('@solana/web3.js');
const { getConnection, sumTokens2 } = require('../helper/solana');


async function tvl() {
  const programId = new PublicKey('CcoYv1X4RczUmuGCUw3Vg1XWxspaofsh8dtD26cmN7nm');
  const connection = getConnection();

  const SPICE_SEED = Buffer.from("SPICE");
  const TREASURY_SEED = Buffer.from("TREASURY");

  const [treasuryAccount] = PublicKey.findProgramAddressSync(
    [SPICE_SEED, TREASURY_SEED],
    programId
  );

  const tokenAccountsData = await connection.getParsedTokenAccountsByOwner(
    treasuryAccount,
    { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") } 
  );

  const tokenAccounts = tokenAccountsData.value.map(account => account.pubkey.toBase58());
  
  return sumTokens2({ tokenAccounts, solOwners: [treasuryAccount.toBase58()], nativeToken: 'solana' });
}

module.exports = {
  timetravel: false,
  solana: { tvl },
};


