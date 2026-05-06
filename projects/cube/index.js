const { Program } = require("@coral-xyz/anchor");
const { getProvider, sumTokens2, getAssociatedTokenAddress } = require("../helper/solana");
const idl = require("./idl.json");

// Cube DEX pool program (mainnet). The on-chain Rust module is named
// `cubic_pool` (legacy name from before the protocol rebrand to Cube),
// hence the Anchor IDL still exposes accounts under `cubicPool`.
// Source of truth for the program ID: sdk/src/config/networks.ts
const PROGRAM_ID = "8iQtGj9mcUfFUGaiCpPy89swC3s8YTC8FhVZWfgeZhwu";

async function tvl(api) {
  const provider = getProvider();
  const program = new Program({ ...idl, address: PROGRAM_ID }, provider);

  const pools = await program.account.cubicPool.all();

  const tokenAccounts = [];
  for (const { publicKey, account } of pools) {
    if (!account.poolEnabled) continue;
    const tokenCount = account.tokenCount;
    for (let i = 0; i < tokenCount; i++) {
      const mint = account.tokenMints[i];
      const tokenProgram = account.tokenPrograms[i];
      const ata = getAssociatedTokenAddress(mint, publicKey, tokenProgram);
      tokenAccounts.push(ata);
    }
  }

  return sumTokens2({ tokenAccounts, api });
}

module.exports = {
  timetravel: false,
  methodology:
    "Sum of USD value of all tokens locked in Cube weighted pools, computed on-chain by reading every pool account from the Cube program and summing balances of each pool's token vaults (derived as ATA(pool, mint, token_program)).",
  solana: {
    tvl,
  },
};
