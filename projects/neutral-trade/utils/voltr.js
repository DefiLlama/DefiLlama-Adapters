const { createHash } = require("crypto");
const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../../helper/solana");
const { VOLTR_VAULT_PROGRAM_ID } = require("../constants");

const VOLTR_VAULT_DISCRIMINATOR_B64 = createHash("sha256").update("account:Vault").digest().subarray(0, 8).toString("base64");
const VOLTR_VAULT_ASSET_MINT_OFFSET = 104;
const VOLTR_VAULT_ASSET_TOTAL_VALUE_OFFSET = 168;
const PUBLIC_KEY_SIZE = 32;
const U64_SIZE = 8;
const VOLTR_VAULT_DATA_SLICE_LENGTH = VOLTR_VAULT_ASSET_TOTAL_VALUE_OFFSET + U64_SIZE;

async function addTvl(api) {
  const connection = getConnection();
  const vaultAccounts = await connection.getProgramAccounts(new PublicKey(VOLTR_VAULT_PROGRAM_ID), {
    filters: [
      { memcmp: { offset: 0, bytes: VOLTR_VAULT_DISCRIMINATOR_B64, encoding: "base64" } },
    ],
    dataSlice: { offset: 0, length: VOLTR_VAULT_DATA_SLICE_LENGTH },
  });

  for (const { account } of vaultAccounts) {
    const mint = new PublicKey(
      account.data.slice(VOLTR_VAULT_ASSET_MINT_OFFSET, VOLTR_VAULT_ASSET_MINT_OFFSET + PUBLIC_KEY_SIZE)
    ).toBase58();
    const totalValue = account.data.readBigUInt64LE(VOLTR_VAULT_ASSET_TOTAL_VALUE_OFFSET);
    if (totalValue > 0n) api.add(mint, totalValue.toString());
  }
}

module.exports = {
  addTvl,
};
