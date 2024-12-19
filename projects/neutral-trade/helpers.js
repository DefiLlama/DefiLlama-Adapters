const { Connection, Keypair } = require("@solana/web3.js");
const { AnchorProvider, Program } = require('@project-serum/anchor');
const { DriftClient } = require('@drift-labs/sdk');
const { IDL, VAULT_PROGRAM_ID, VaultClient } = require("@drift-labs/vaults-sdk");
const { JLPDN_PROGAM_ID_V1 } = require("./constants");


/// INIT DRIFT SDK
const initialize = async () => {
  const connection = new Connection('https://cold-hanni-fast-mainnet.helius-rpc.com/');
  const wallet = Keypair.generate();
  const initializeDriftClient = async () => {
    const driftClient = new DriftClient({
      connection,
      wallet,
      env: "mainnet-beta",
    });
    await driftClient.subscribe();
    return driftClient;
  };
  const initializeProgram = (version) => {
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    return new Program(
      IDL,
      version == 1 ? JLPDN_PROGAM_ID_V1 : VAULT_PROGRAM_ID,
      provider
    );
  };
  const initializeVaultClient = async (version) => {
    return new VaultClient({
      driftClient: await initializeDriftClient(),
      program: initializeProgram(version),
      cliMode: true,
    });
  };
  const client = await initializeVaultClient();
  const client_jlpdnv1 = await initializeVaultClient(1);
  return { client, client_jlpdnv1 };
};


/**
 * Utility function to format a timestamp into YYYY-MM-DD format.
 * @param {number} ts - The timestamp in milliseconds.
 * @returns {string} - The formatted date string.
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


module.exports = {
  initialize,
  formatDate,
};
