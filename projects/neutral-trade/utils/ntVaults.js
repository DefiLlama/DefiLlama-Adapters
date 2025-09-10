const { getProvider } = require('../../helper/solana');
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { NT_VAULT_PROGRAM_ID } = require("../constants");


function getProgram() {
  const idl = require('../idl/ntbundle.json');
  const programId = new PublicKey(NT_VAULT_PROGRAM_ID);
  const provider = getProvider();
  return new Program(idl, programId, provider);
}

function deriveOraclePDA(vaultPDA) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("ORACLE"), vaultPDA.toBuffer()],
    new PublicKey(NT_VAULT_PROGRAM_ID),
  );
  return pda;
}

async function getTvl(vaultAddress) {
  const program = getProgram();
  const ntVaultPDA = new PublicKey(vaultAddress);
  const ntVault = await program.account.bundle.fetch(ntVaultPDA);
  const ntOracle = await program.account.oracleData.fetch(deriveOraclePDA(ntVaultPDA));
  return ntVault.bundleUnderlyingBalance.toNumber() + ntOracle.averageExternalEquity.toNumber();
}

module.exports = {
  getTvl
};
