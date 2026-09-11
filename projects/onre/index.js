const { getAssociatedTokenAddress, getConnection, TOKEN_PROGRAM_ID } = require('../helper/solana');
const ADDRESSES = require('../helper/coreAssets.json');
const { PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');

const USDC_MINT = new PublicKey(ADDRESSES.solana.USDC);
const ONYC_MINT = new PublicKey("5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5");
const PROGRAM_ID = new PublicKey("onreuGhHHgVzMWSkj2oQDLDtvvGvoepBPkqyaubFcwe");
const GET_TVL_DISCRIMINATOR = Buffer.from([88, 225, 219, 204, 86, 91, 184, 51]);
const BPF_LOADER_UPGRADEABLE = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111');

async function tvl(api) {
  const connection = getConnection();

  const [programDataAddress] = PublicKey.findProgramAddressSync(
    [PROGRAM_ID.toBuffer()],
    BPF_LOADER_UPGRADEABLE
  );
  const programDataInfo = await connection.getAccountInfo(programDataAddress);
  const feePayer = new PublicKey('28nYGHJyUVcVdxZtzKByBXEj127XnrUkrE3VaGuWj1ZU'); // random wallet with SOL

  const [offerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("offer"), USDC_MINT.toBuffer(), ONYC_MINT.toBuffer()],
    PROGRAM_ID
  );
  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("offer_vault_authority")],
    PROGRAM_ID
  );
  const vaultTokenOutAccount = new PublicKey(
    getAssociatedTokenAddress(ONYC_MINT, vaultAuthority, TOKEN_PROGRAM_ID)
  );

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: offerPda, isSigner: false, isWritable: false },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: ONYC_MINT, isSigner: false, isWritable: false },
      { pubkey: vaultAuthority, isSigner: false, isWritable: false },
      { pubkey: vaultTokenOutAccount, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: GET_TVL_DISCRIMINATOR,
  });

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer });
  tx.add(instruction);

  const result = await connection.simulateTransaction(tx);

  if (result.value.err) {
    throw new Error(`Simulation failed: ${JSON.stringify(result.value.err)}`);
  }

  const returnData = result.value.returnData?.data?.[0];
  if (!returnData) {
    throw new Error('No return data from simulation');
  }

  const tvlValue = Buffer.from(returnData, 'base64').readBigUInt64LE(0);
  api.add(ADDRESSES.solana.USDC, Number(tvlValue / 1000n));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: { tvl },
};
