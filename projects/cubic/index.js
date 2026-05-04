const { Program } = require("@coral-xyz/anchor");
const { getProvider, sumTokens2, getAssociatedTokenAddress } = require("../helper/solana");
const idl = require("./idl.json");

// Cubic Pool program (mainnet). Source of truth: sdk/src/config/networks.ts
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
    "Sum of USD value of all tokens locked in Cubic weighted pools, computed on-chain by reading every CubicPool account from the program and summing balances of each pool's token vaults (derived as ATA(pool, mint, token_program)).",
  solana: {
    tvl,
  },
};
