const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const idl = require("./idl.json");

const PROGRAM_ID = "4nvcyXwTMAqM1ZoZbJWvcPXtg8dNXVbt2CFaXVwaPbT6";

async function tvl(api) {
  const provider = getProvider(api.chain);
  const program = new Program(idl, PROGRAM_ID, provider);
  const pools = await program.account.virtualPool.all();
  const tokenAccounts = [];
  for (const { account } of pools) {
    if (account.isMigrated) continue;
    tokenAccounts.push(account.baseVault, account.quoteVault);
  }
  return sumTokens2({ tokenAccounts, api });
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  pyra: { tvl },
  methodology:
    "TVL is calculated by summing token balances in active (non-migrated) Pyra Launchpad bonding curve pools.",
};
