const { Program } = require("@coral-xyz/anchor");
const { getProvider, sumTokens2, getAssociatedTokenAddress } = require("../helper/solana");
const idl = require("./idl.json");

async function tvl(api) {
  const program = new Program(idl, getProvider());
  const pools = await program.account.cubicPool.all();

  const tokenAccounts = [];
  for (const { publicKey, account } of pools) {
    if (!account.poolEnabled) continue;
    for (let i = 0; i < account.tokenCount; i++) {
      tokenAccounts.push(getAssociatedTokenAddress(account.tokenMints[i], publicKey, account.tokenPrograms[i]));
    }
  }

  return sumTokens2({ tokenAccounts, api, allowError: true });
}

module.exports = {
  timetravel: false,
  methodology:
    "Sum of USD value of all tokens locked in Cube weighted pools, computed on-chain by reading every pool account from the Cube program and summing balances of each pool's token vaults (derived as ATA(pool, mint, token_program)).",
  solana: {
    tvl,
  },
};