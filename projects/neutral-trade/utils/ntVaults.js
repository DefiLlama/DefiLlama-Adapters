const { getEnv } = require('../../helper/env');
const idl = require('../idl/ntbundle.json');
const { AnchorProvider, Program } = require("@project-serum/anchor");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { NT_VAULT_PROGRAM_ID } = require("../constants");


function makeDummyWallet() {
  const kp = Keypair.generate();
  return {
    publicKey: kp.publicKey,
    async signTransaction(tx) {
      tx.partialSign(kp);
      return tx;
    },
    async signAllTransactions(txs) {
      txs.forEach((t) => t.partialSign(kp));
      return txs;
    },
  };
}

function getAnchorProgram() {
  const dummyWallet = makeDummyWallet();
  const connection = new Connection(getEnv('SOLANA_RPC'));
  const provider = new AnchorProvider(connection, dummyWallet, AnchorProvider.defaultOptions());
  return new Program(idl, new PublicKey(NT_VAULT_PROGRAM_ID), provider);
}

function deriveOraclePDA(vaultPDA) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("ORACLE"), vaultPDA.toBuffer()],
    new PublicKey(NT_VAULT_PROGRAM_ID),
  );
  return pda;
}

async function getTvl(vaultAddress) {
  const program = getAnchorProgram();
  const ntVaultPDA = new PublicKey(vaultAddress);
  const ntVault = await program.account.bundle.fetch(ntVaultPDA);
  const ntOracle = await program.account.oracleData.fetch(deriveOraclePDA(ntVaultPDA));
  return ntVault.bundleUnderlyingBalance.toNumber() + ntOracle.averageExternalEquity.toNumber();
}

module.exports = {
  getTvl
};
