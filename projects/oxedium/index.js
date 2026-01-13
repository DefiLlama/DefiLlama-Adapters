const { PublicKey } = require('@solana/web3.js');
const { getConnection, sumTokens2 } = require('../helper/solana');


async function tvl() {
  const programId = new PublicKey('oxe1SKL52HMLBDT2JQvdxscA1LbVc4EEwwSdNZcnDVH');
  const connection = getConnection();

  const OXEDIUM_SEED = Buffer.from("oxedium-seed");
  const TREASURY_SEED = Buffer.from("treasury-seed");

  const [treasuryAccount] = PublicKey.findProgramAddressSync(
    [OXEDIUM_SEED, TREASURY_SEED],
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


